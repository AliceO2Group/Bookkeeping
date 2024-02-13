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
const { dataSource } = require('../../database/DataSource.js');
const { repositories: { DataPassRepository, RunRepository, SimulationPassRepository } } = require('../../database/index.js');
const { extractLhcPeriod } = require('../utilities/extractLhcPeriod.js');
const { getOrCreateLhcPeriod } = require('../services/lhcPeriod/getOrCreateLhcPeriod.js');
const { Op } = require('sequelize');

/**
 * Manger of synchronization with MonALISA
 */
class MonALISASynchronizer {
    /**
     * Constructor
     * @param {MonALISAClient} monALISAClient interface with MonALISA
     */
    constructor(monALISAClient) {
        this.logger = new Log(MonALISASynchronizer.name);
        this._monALISAInterface = monALISAClient;
    }

    /**
     * Synchronize DB data with Data Passes and Simulation Passes fetched from MonALISA
     * @return {Promise} promise
     */
    async synchronize() {
        await this._synchronizeDataPassesFromMonALISA();
        await this._synchronizeSimulationPassesFromMonAlisa();
    }

    /**
     * Synchronize with data from MonALISA
     * Update Data Passes data in local DB
     * @return {Promise<void>} promise
     * @private
     */
    async _synchronizeDataPassesFromMonALISA() {
        try {
            const dataPassesLastRunNumber = await this._getAllDataPassesLastRunNumber();
            const dataPasses = (await this._monALISAInterface.getDataPasses())
                .filter((dataPass) => this._doesDataPassNeedUpdate(dataPass, dataPassesLastRunNumber));

            // eslint-disable-next-line require-jsdoc
            const transactionablePipeline = async (dataPass) => {
                const lhcPeriodDB = await getOrCreateLhcPeriod({ name: extractLhcPeriod(dataPass.name).name });
                await DataPassRepository.upsert({ lhcPeriodId: lhcPeriodDB.id, ...dataPass });
                const dataPassDB = await DataPassRepository.findOne({ where: { name: dataPass.name } });
                const { runNumbers } = await this._monALISAInterface.getDataPassDetails(dataPassDB.description);
                const runs = await RunRepository.findAll(dataSource.createQueryBuilder().where('runNumber').oneOf(...runNumbers));
                await dataPassDB.addRuns(runs, { ignoreDuplicates: true });
            };

            for (const dataPass of dataPasses) {
                await dataSource.transaction(() => transactionablePipeline(dataPass))
                    .catch((error) => this.logger.errorMessage(error.message, {}));
            }
            this.logger.debug('Synchronization of Data Passes completed');
        } catch (error) {
            this.logger.errorMessage(error.message, {});
            this.logger.debug('Synchronization of Data Passes failed');
        }
    }

    /**
     * Check wether data pass needs to be updated
     * @param {DataPass} dataPass data pass
     * @param {Object<string, number>} dataPassesLastRunNumber mapping: data pass name -> its last run
     * @return {boolean} true if it is needed to update data pass
     * @private
     */
    _doesDataPassNeedUpdate(dataPass, dataPassesLastRunNumber) {
        const isLastRunNumberSame = dataPass.lastRun && dataPass.lastRun === dataPassesLastRunNumber[dataPass.name];
        return !isLastRunNumberSame;
    }

    /**
     * Fetch last runs information telling whether some data pass must be updated
     * last run number of a data pass is the greatest, stored run number associated with given data pass
     * @return {Object<string, number>} mapping data pass name -> its last run
     * @private
     */
    async _getAllDataPassesLastRunNumber() {
        const queryBuilder = dataSource.createQueryBuilder()
            .set('raw', true)
            .set('attributes', ['name'])
            .include((sequelize) => ({
                association: 'runs',
                attributes: [[sequelize.fn('max', sequelize.col('runs.run_number')), 'lastRun']],
                through: { attributes: [] },
            }))
            .groupBy('name');

        const dataPassesWithLastStoredRunNumber = await DataPassRepository.findAll(queryBuilder);

        const lastRunNumbersEntries = dataPassesWithLastStoredRunNumber.map((lastRunData) => {
            const { name, lastRun } = lastRunData;
            return [name, lastRun];
        });

        return Object.fromEntries(lastRunNumbersEntries);
    }

    /**
     * Synchronize with data from MonALISA
     * Update Simulation Passes data in local DB
     * @return {Promise<void>} promise
     * @private
     */
    async _synchronizeSimulationPassesFromMonAlisa() {
        try {
            const simulationPasses = await this._monALISAInterface.getSimulationPasses();
            for (const simulationPass of simulationPasses) {
                await dataSource.transaction(() => this._updateOneSimulationPass(simulationPass))
                    .catch((error) => this.logger.errorMessage(`Error for ${simulationPass.properties.name}: ${error.message}`, {}));
            }
            this.logger.debug('Synchronization of Simulation Passes completed');
        } catch (error) {
            this.logger.errorMessage(error.message, {});
            this.logger.debug('Synchronization of Simulation Passes failed');
        }
    }

    /**
     * Update one Simulation Pass in DB with data fetched from MonALISA
     * @param {{properties: SimulationPass, associations: SimulationPassAssociations}} simulationPassData simulation pass properties
     * and its associations
     * @return {Promise<void>} promise
     * @private
     */
    async _updateOneSimulationPass(simulationPassData) {
        const { properties: simulationPassProperties,
            associations: { lhcPeriods, dataPassesSuffixes, runNumbers } } = simulationPassData;

        const dataPassesNames = lhcPeriods.flatMap((lhcPeriod) => dataPassesSuffixes.map((suffix) => `${lhcPeriod}_${suffix}`));
        const associatedDataPasses = await DataPassRepository.findAll({ where: { name: { [Op.in]: dataPassesNames } } });
        if (associatedDataPasses.length === 0) {
            throw new Error(`${simulationPassProperties.name} is not associated to any Data Pass`);
        }

        await SimulationPassRepository.upsert(simulationPassProperties);
        const simulationPassDB = await SimulationPassRepository.findOne({ where: { name: simulationPassProperties.name } });
        await simulationPassDB.addDataPass(associatedDataPasses, { ignoreDuplicates: true });

        const associatedRuns = await RunRepository.findAll({ where: { runNumber: { [Op.in]: runNumbers } } });
        if (associatedRuns.length > 0) {
            await simulationPassDB.addRuns(associatedRuns, { ignoreDuplicates: true });
        }
    }
}

exports.MonALISASynchronizer = MonALISASynchronizer;
