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
 * Service to synchronize data passes related data from MonALISA
 */
class DataPassesSynchronizer {
    /**
     * Constructor
     * @param {object} configuration configuration of synchronizer
     * @param {URL|string} [configuration.baseUrl] url to fetch data from
     * @param {byte[]} [configuration.pfx] bytes of PKCS12 certificate
     * @param {string} [configuration.passphrase] to the certificate
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

        this.yearLowerLimit = yearLowerLimit;
        this.fieldsMapping = {
            name: true,
            reconstructed_events: 'reconstructedEvents',
            description: true,
            output_size: 'outputSize',
            last_run: 'lastRun',
        };
    }

    /**
     * Combine logic of fetching data MonALISA,
     * processing and inserting to database
     * @returns {Promise<void>} promise
     */
    async sync() {
        const { default: fetch } = await import('node-fetch');
        const context = await this._getContext();

        return await fetch(this.baseUrl, this.httpOptions)
            .then((response) => response.json())
            .then((rawData) => this._processRawResponse(rawData, context))
            .then((data) => this._executeDbAction(data));
    }

    /**
     * Get synchronization context
     * Fetch lastRun information telling whether some data pass must be updated
     * @return {{lastRuns: Object<string, number>}} context
     */
    async _getContext() {
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

        return {
            lastRuns: Object.fromEntries(lastRunsEntries),
            yearLowerLimit: this.yearLowerLimit,
        };
    }

    /**
     * Check wether data of one data pass are valid
     * @param {SequelizeDataPass} dataPass data pass data
     * @param {Partial<LhcPeriod>} lhcPeriod data pass data
     * @param {{lastRuns: Object<string, number>}} context holding about last runs associated with data passes
     * @return {boolean} true if it is needed to update data pass
     */
    _doesDataPassNeedUpdate(dataPass, lhcPeriod, context) {
        return lhcPeriod?.year >= context.yearLowerLimit &&
            (!dataPass.lastRun ||
            dataPass.lastRun !== context.lastRuns[dataPass.name]);
    }

    /**
     * Adapt data pass data
     * @param {object} dataPass data pass
     * @return {SequelizeDataPass} adapted data pass
     */
    _adaptSingleDataPassToLocalDBFormat(dataPass) {
        const dataPassDB = mapObjectProperties(dataPass, this.fieldsMapping);
        dataPassDB.outputSize = dataPassDB.outputSize ? Number(dataPassDB.outputSize) : null;
        return dataPassDB;
    }

    /**
     * Is used to process raw response to custom format, remove unnecessary data
     * @param {object} rawResponse raw data acquired from external service
     * @param {object} context context of synchronization
     * @return {[Partial<SequelizeDataPass>, Partial<LhcPeriod>][]} adjusted data
     */
    async _processRawResponse(rawResponse, context) {
        return Object.entries(rawResponse)
            .map(([dataPassName, dataPassParamenters]) => ({
                name: dataPassName.trim(),
                ...dataPassParamenters,
            }))
            .filter((dataPass) => dataPass.name.match(RegExp(`${LHC_PERIOD_NAME_REGEX.source}_`)))
            .map((dataPass) => [dataPass, extractLhcPeriod(dataPass.name)])
            .filter(([dataPass, lhcPeriod]) => this._doesDataPassNeedUpdate(dataPass, lhcPeriod, context))
            .map((dataPass, lhcPeriod) => this._adaptSingleDataPassToLocalDBFormat(dataPass, lhcPeriod));
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
