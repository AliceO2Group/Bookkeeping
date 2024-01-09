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

const { AbstractHTTPSynchronizer } = require('./AbstractHTTPSynchronizer');
const { sequelize } = require('../../database');
const https = require('https');
const { LHC_PERIOD_NAME_REGEX } = require('../utilities/extractLhcPeriod');

/**
 * Service to synchronize data passes related data from MonALISA
 */
class DataPassesSynchronizer extends AbstractHTTPSynchronizer {
    /**
     * Constructor
     */
    constructor({
        pfx,
        passphrase,
        yearLowerLimit,
    } = {}) {
        super({ agent: pfx && passphrase ? new https.Agent({ pfx, passphrase }) : undefined });

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
     * Get synchronization context
     * @return {object} context
     */
    async getContext() {
        // eslint-disable-next-line function-paren-newline
        const [lastRunsData] = await sequelize.query(
            'SELECT name, last_run, max(dpr.run_number) as last_run_in_details \
            FROM data_passes AS dp \
            LEFT JOIN data_passes_runs AS dpr \
                ON dpr.data_pass_id = dp.id \
            GROUP BY name, last_run;');

        const lastRunsEntries = lastRunsData.map((lastRunData) => {
            const { name, last_run: lastRun, last_run_in_details: lastRunInDetails } = lastRunData;
            return [name, { lastRun, lastRunInDetails }];
        });

        this.lastRuns = Object.fromEntries(lastRunsEntries);

        return { lastRuns: this.lastRuns };
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    async syncPerEndpoint(url) {
        super.syncPerEndpoint(url, await this.getContext());
    }

    /**
     * Check wether data of one data pass are valid
     * @param {object} dataPass data pass data
     * @return {boolean} true if data pass is valid
     */
    isDataUnitValid(dataPass) {
        const { lastRun, lastRunInDetails } = this.lastRuns[dataPass.name] ?? {};
        return dataPass.period.year >= this.yearLowerLimit &&
            (dataPass.lastRun !== lastRun || lastRun !== lastRunInDetails);
    }

    /**
     * Adjust data pass data to desired format
     * @param {object} dataPass data pass
     * @return {object} adjusted data pass
     */
    adjustDataUnit(dataPass) {
        dataPass = Utils.filterObject(dataPass, this.fieldsMapping);
        dataPass.outputSize = dataPass.outputSize ? Number(dataPass.outputSize) : null;
        dataPass.lhcPeriodName = dataPass.name.slice(0, 5);
        return dataPass;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    async processRawResponse(rawResponse) {
        return Object.entries(rawResponse)
            .map(([dataPassName, dataPassData]) => {
                dataPassData['name'] = dataPassName.trim();
                return dataPassData;
            })
            .filter((r) => r.name?.match(RegExp(`${LHC_PERIOD_NAME_REGEX.source}_`)))
            .map(this.adjustDataUnit.bind(this));
    }

    async executeDbAction(data, context) {
        // TODO
    }
}

exports.DataPassesSynchronizer = DataPassesSynchronizer;
