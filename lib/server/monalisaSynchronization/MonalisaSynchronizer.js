/**
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
const { Log } = require('@aliceo2/web-ui');
const { setupMonalisaInterface } = require('./MonalisaInterface.js');
const { dataSource } = require('../../database/DataSource.js');
const { repositories: { DataPassRepository, RunRepository } } = require('../../database/index.js');
const { extractLhcPeriod } = require('../utilities/extractLhcPeriod.js');
const { getOrCreateLhcPeriod } = require('../services/lhcPeriod/getOrCreateLhcPeriod.js');

/**
 * Manger of syncronization with external servces
 */
class MonalisaSynchronizer {
    /**
     * Constructor
     */
    constructor() {
        this.logger = new Log(MonalisaSynchronizer.name);
        this.monalisaInterface = null;
    }

    /**
     * Synchronize with data from MonALISA
     * Update Data Passes data in local DB
     * @return {Promise<void>} promise
     */
    async synchronizeDataPassesFromMonalisa() {
        if (!this.monalisaInterface) {
            this.monalisaInterface = await setupMonalisaInterface();
        }

        try {
            this.lastRuns = await this._getLastRunsInformation();
            const dataPasses = (await this.monalisaInterface.getDataPasses()).filter((dataPass) => this._doesDataPassNeedUpdate(dataPass));
            // eslint-disable-next-line require-jsdoc
            const transactionablePipeline = async (dataPass) => {
                const lhcPeriodDB = await getOrCreateLhcPeriod({ name: extractLhcPeriod(dataPass.name).name });
                await DataPassRepository.upsert({ lhcPeriodId: lhcPeriodDB.id, ...dataPass });
                const dataPassDB = await DataPassRepository.findOne({ where: { name: dataPass.name } });
                const { runNumbers } = await this.monalisaInterface.getDataPassDetails(dataPassDB.description);
                const runs = await RunRepository.findAll(dataSource.createQueryBuilder().where('runNumber').oneOf(...runNumbers));
                await dataPassDB.addRuns(runs, { ignoreDuplicates: true });
            };

            for (const dataPass of dataPasses) {
                await dataSource.transaction(() => transactionablePipeline(dataPass));
            }
            this.logger.info('Synchronization completed');
        } catch (error) {
            this.logger.error(error.message);
        }
    }

    /**
     * Check wether data pass needs to be updated
     * @param {DataPass} dataPass data pass
     * @return {boolean} true if it is needed to update data pass
     */
    _doesDataPassNeedUpdate(dataPass) {
        const isLastRunNumberSame = dataPass.lastRun && dataPass.lastRun === this.lastRuns[dataPass.name];
        return !isLastRunNumberSame;
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
}

module.exports = {
    // MonalisaSynchronizer: MonalisaSynchronizer,
    monalisaSynchronizer: new MonalisaSynchronizer(),
};
