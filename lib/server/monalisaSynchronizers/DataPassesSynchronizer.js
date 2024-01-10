/**
 *
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

const { fs } = require('fs');
const { ServicesConfig: { monalisa: monalisaConfiguration } } = require('../../config');

const { Log } = require('@aliceo2/web-ui');
const https = require('https');
const { LHC_PERIOD_NAME_REGEX } = require('../utilities/extractLhcPeriod');

const { repositories: { DataPassRepository } } = require('../../database');
const { LhcPeriodRepository } = require('../../database/repositories');
const { dataSource } = require('../../database/DataSource.js');
const { mapObjectProperties } = require('../utilities/mapObjectProperties.js');
const { extractLhcPeriod } = require('../utilities/extractLhcPeriod.js');

/**
 * @typedef MonalisaDataPass
 * @param {string} name
 * @param {number} reconstructed_events
 * @param {string} description
 * @param {number} output_size
 * @param {number} last_run
 */

/**
 * Service to synchronize data passes related data from MonALISA
 */
class DataPassesSynchronizer {
    /**
     * Constructor
     * @param {object} configuration configuration of synchronizer
     * @param {URL|string} [configuration.baseUrl] url to fetch data from
     * @param {string|string[]|Buffer|Buffer[]|Object[]} [configuration.pfx] PFX or PKCS12 encoded private key and certificate chain
     * @see tls.createSecureContext([options])
     * @param {string} [configuration.passphrase] passphrase to the certificate
     * @param {number} [configuration.yearLowerLimit] indicates how old data are accepted,
     * year of lhc period that given data pass belong must be greater or equal
     */
    constructor({
        baseUrl,
        pfx,
        passphrase,
        yearLowerLimit,
    } = {}) {
        this.logger = new Log(this.constructor.name);
        this.baseUrl = new URL(baseUrl);

        this.httpOptions = {
            headers: {
                Accept:	'application/json;charset=utf-8',
                Connection:	'keep-alive',
            },
            agent: pfx && passphrase ? new https.Agent({ pfx, passphrase }) : undefined,
        };

        this.synchronizationContext = {
            yearLowerLimit,
            lastRuns: null,
        };

        this.fieldsMapping = {
            name: true,
            reconstructed_events: 'reconstructedEvents',
            description: true,
            output_size: 'outputSize',
            last_run: 'lastRun',
        };
    }

    /**
     * Combine logic of fetching data from MonALISA,
     * processing and inserting to database
     * @returns {Promise<void>} promise
     */
    async sync() {
        const { default: fetch } = await import('node-fetch');
        this.synchronizationContext.lastRuns = await this._getLastRunsInformation();

        try {
            const payload = await fetch(this.baseUrl, this.httpOptions).then((response) => response.json());
            const data = await this._processRawResponse(payload);
            await this._executeDbAction(data);
        } finally {
            this.synchronizationContext.lastRuns = null;
        }
    }

    /**
     * Fetch lastRun information telling whether some data pass must be updated
     * lastRun of a data pass is the greatest run number associated with given data pass
     * @return {Object<string, number>} mapping data pass name -> its last run
     */
    async _getLastRunsInformation() {
        const queryBuilder = dataSource.createQueryBuilder()
            .set('raw', true)
            .set('attributes', ['name'])
            .include((sequelize) => ({
                association: 'runs',
                attributes: [[sequelize.fn('max', sequelize.col('runs.run_number')), 'lastRun']],
                through: { attributes: [] },
            }))
            .groupBy('name');

        const lastRunsData = await DataPassRepository.findAll(queryBuilder);

        const lastRunsEntries = lastRunsData.map((lastRunData) => {
            const { name, lastRun } = lastRunData;
            return [name, lastRun];
        });

        return Object.fromEntries(lastRunsEntries);
    }

    /**
     * Check wether data of one data pass are valid
     * @param {SequelizeDataPass} dataPass data pass data
     * @param {Partial<LhcPeriod>} lhcPeriod lhc period data the data pass belongs to
     * @return {boolean} true if it is needed to update data pass
     */
    _doesDataPassNeedUpdate(dataPass, lhcPeriod) {
        const isYearOutOfBound = lhcPeriod.year < this.synchronizationContext.yearLowerLimit;
        const isLastRunNumberSame = dataPass.lastRun && dataPass.lastRun === this.synchronizationContext.lastRuns[dataPass.name];
        return !isYearOutOfBound && !isLastRunNumberSame;
    }

    /**
     * Adapt data pass data
     * @param {MonalisaDataPass} dataPass data pass
     * @return {SequelizeDataPass} adapted data pass
     */
    _adaptSingleDataPassToLocalDBObject(dataPass) {
        const dataPassDB = mapObjectProperties(dataPass, this.fieldsMapping);
        dataPassDB.outputSize = dataPassDB.outputSize ? Number(dataPassDB.outputSize) : null;
        return dataPassDB;
    }

    /**
     * Process server response payload to database entites, remove unnecessary data
     * @param {object<string, Partial<MonalisaDataPass>>} payload raw data acquired from MonALISA: mapping of Data Pass Name to its parameters
     * @return {[SequelizeDataPass, Partial<LhcPeriod>][]} adapted data
     */
    async _processRawResponse(payload) {
        return Object.entries(payload)
            .map(([dataPassName, dataPassParamenters]) => ({
                name: dataPassName.trim(),
                ...dataPassParamenters,
            }))
            .filter((dataPass) => dataPass.name.match(RegExp(`${LHC_PERIOD_NAME_REGEX.source}_`)))
            .map((dataPass) => [dataPass, extractLhcPeriod(dataPass.name)])
            .filter(([dataPass, lhcPeriod]) => this._doesDataPassNeedUpdate(dataPass, lhcPeriod))
            .map((dataPass, lhcPeriod) => this._adaptSingleDataPassToLocalDBObject(dataPass, lhcPeriod));
    }

    /**
     * Implements logic for inserting/updating database
     * @param {[Partial<SequelizeDataPass>, Partial<LhcPeriod>][]} data data passes and correspoding lhc periods list
     * @return {Promise<void>} promise
     */
    async _executeDbAction(data) {
        // eslint-disable-next-line require-jsdoc
        const pipeline = async (dataPass, lhcPeriod) => {
            const sequelizeLhcPeriod = LhcPeriodRepository.findOne({ where: { name: lhcPeriod.name } });
            return DataPassRepository.upsert({ lhcPeriodId: sequelizeLhcPeriod.id, ...dataPass });
        };

        for (const [dataPass, lhcPeriod] of data) {
            await dataSource.transaction(() => pipeline(dataPass, lhcPeriod));
        }
    }
}

exports.DataPassesSynchronizer = DataPassesSynchronizer;

/**
 * Create new instace of DataPassesSynchronizer
 * @return {DataPassesSynchronizer} instance configured with environmental varaibles
 */
exports.setupDataPassesSynchronizer = async () => new DataPassesSynchronizer({
    baseUrl: monalisaConfiguration.dataPassesUrl,
    yearLowerLimit: monalisaConfiguration.dataPassesYearLowerLimit,
    pfx: fs.readFile(monalisaConfiguration.userCertificate.path, (error, data) => {
        if (error) {
            throw error;
        }
        return data;
    }),
    passphrase: monalisaConfiguration.userCertificate.passphrase,
});
