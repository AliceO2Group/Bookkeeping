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

const { ServicesConfig: { monalisa } } = require('../../config');

const { Log } = require('@aliceo2/web-ui');
const { sequelize } = require('../../database');
const https = require('https');
const { LHC_PERIOD_NAME_REGEX } = require('../utilities/extractLhcPeriod');

const { repositories: { DataPassRepository } } = require('../../database');
const { LhcPeriodRepository } = require('../../database/repositories');
const { dataSource } = require('../../database/DataSource.js');
const { mapObjectProperties } = require('../utilities/mapObjectProperties.js');

/**
 * Service to synchronize data passes related data from MonALISA
 */
class DataPassesSynchronizer {
    /**
     * Constructor
     * @param {object} configuration configuration of synchronizer
     * @param {URL} [configuration.baseUrl] url to fetch data from
     * @param {byte[]} [configuration.pfx] bytes of pkcs12 certificate
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
        this.baseUrl = baseUrl;

        this.httpOptions = {
            headers: {
                Accept:	'application/json;charset=utf-8',
                Connection:	'keep-alive',
            },
            agent: pfx && passphrase ? new https.Agent({ pfx, passphrase }) : undefined,
        };

        this.yearLowerLimit = yearLowerLimit;
        this.fieldsMapping = {
            name: 'name',
            reconstructed_events: 'reconstructedEvents',
            description: 'description',
            output_size: 'outputSize',
            interaction_type: 'beam_type',
            last_run: 'lastRun',
        };
    }

    /**
     * Combine logic of fetching data from service like MonALISA,
     * processing and inserting to database
     * @returns {Promise<void>} promise
     */
    async sync() {
        const { default: fetch } = await import('node-fetch');
        const context = await this.getContext();

        return await fetch(this.baseUrl, this.httpOptions)
            .then((response) => response.json())
            .then((rawData) => this.processRawResponse(rawData, context))
            .then((data) => this.executeDbAction(data));
    }

    /**
     * Get synchronization context
     * Fetch lastRun information telling whether some data pass must be updated
     * @return {object} context
     */
    async getContext() {
        // eslint-disable-next-line function-paren-newline
        const [lastRunsData] = await sequelize.query(
            'SELECT name, max(dpr.run_number) as last_run_in_details \
            FROM data_passes AS dp \
            LEFT JOIN data_passes_runs AS dpr \
                ON dpr.data_pass_id = dp.id \
            GROUP BY name;');

        const lastRunsEntries = lastRunsData.map((lastRunData) => {
            const { name, last_run_in_details: lastRun } = lastRunData;
            return [name, lastRun];
        });

        return {
            lastRuns: Object.fromEntries(lastRunsEntries),
            yearLowerLimit: this.yearLowerLimit,
        };
    }

    /**
     * Check wether data of one data pass are valid
     * @param {object} dataPass data pass data
     * @param {object} context context of synchronization
     * @return {boolean} true if data pass is valid
     */
    isDataPassValid(dataPass, context) {
        if (!dataPass.name?.match(RegExp(`${LHC_PERIOD_NAME_REGEX.source}_`))) {
            return false;
        }
        return dataPass.period.year >= context.yearLowerLimit &&
            dataPass.lastRun &&
            dataPass.lastRun !== context.lastRuns[dataPass.name];
    }

    /**
     * Adjust data pass data to desired format
     * @param {object} dataPass data pass
     * @return {object} adjusted data pass
     */
    adjustSingleDataPass(dataPass) {
        dataPass = mapObjectProperties(dataPass, this.fieldsMapping);
        dataPass.outputSize = dataPass.outputSize ? Number(dataPass.outputSize) : null;
        dataPass.lhcPeriodName = dataPass.name.slice(0, 5);
        return dataPass;
    }

    /**
     * Used to process raw response to custom format, remove unnecessary data
     * @param {object} rawResponse raw data acquired from external service
     * @param {object} context context of synchronization
     * @return {object[]} adjusted data
     */
    async processRawResponse(rawResponse, context) {
        return Object.entries(rawResponse)
            .map(([dataPassName, dataPassData]) => {
                dataPassData['name'] = dataPassName.trim();
                return dataPassData;
            })
            .filter((dataPass) => this.isDataPassValid(dataPass, context))
            .map((dataPass) => this.adjustSingleDataPass(dataPass));
    }

    /**
     * Implements logic for inserting/updating database
     * @param {object[]} dataPasses data passes list
     * @return {Promise<void>} promise
     */
    async executeDbAction(dataPasses) {
        // eslint-disable-next-line require-jsdoc
        const pipeline = (dataPass) => LhcPeriodRepository
            .findOne({ name: dataPass.lhcPeriodName })
            .then(([lhcPeriod]) => DataPassRepository.upsert({ lhcPeriodId: lhcPeriod.id, ...dataPass }))
            .then(([_dataPass]) => { /** TODO data pass details fetching; use */});

        for (const dataPass of dataPasses) {
            await dataSource.transaction(() => pipeline(dataPass));
        }
    }
}

exports.DataPassesSynchronizer = DataPassesSynchronizer;

exports.dataPassesSynchronizer = new DataPassesSynchronizer({
    url: monalisa.dataPassesUrl,
    yearLowerLimit: monalisa.dataPassesYearLowerLimit,
    pfx: monalisa.userCertificate.pfx,
    passphrase: monalisa.userCertificate.passphrase,
});
