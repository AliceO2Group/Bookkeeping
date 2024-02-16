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
const { RunDefinition } = require('../services/run/getRunDefinition.js');

/**
 * Manger of synchronization with MonAlisa
 */
class MonAlisaSynchronizer {
    /**
     * Constructor
     * @param {MonAlisaClient} monAlisaClient interface with MonAlisa
     */
    constructor(monAlisaClient) {
        this.logger = new Log(MonAlisaSynchronizer.name);
        this._monAlisaInterface = monAlisaClient;
    }

    /**
     * Synchronize DB data with Data Passes and Simulation Passes fetched from MonAlisa
     * @return {Promise} promise
     */
    async synchronize() {
        await this._synchronizeDataPassesFromMonAlisa();
        await this._synchronizeSimulationPassesFromMonAlisa();
    }

    /**
     * Synchronize with data from MonAlisa
     * Update Data Passes data in local DB
     * @return {Promise<void>} promise
     * @private
     */
    async _synchronizeDataPassesFromMonAlisa() {
        try {
            const dataPassesLastRunNumber = await this._getAllDataPassesLastRunNumber();
            const dataPasses = (await this._monAlisaInterface.getDataPasses())
                .filter((monalisaDataPass) => this._doesDataPassNeedUpdate(monalisaDataPass, dataPassesLastRunNumber));

            // eslint-disable-next-line require-jsdoc
            const transactionablePipeline = async (monalisaDataPass) => {
                const lhcPeriodDB = await getOrCreateLhcPeriod({ name: extractLhcPeriod(monalisaDataPass.name).name });
                await DataPassRepository.upsert({ lhcPeriodId: lhcPeriodDB.id, ...monalisaDataPass });
                const dataPass = await DataPassRepository.findOne({ where: { name: monalisaDataPass.name } });
                const { runNumbers } = await this._monAlisaInterface.getDataPassDetails(dataPass.description);
                const associatedRuns = await RunRepository.findAll({
                    where: {
                        runNumber: { [Op.in]: runNumbers },
                        definition: RunDefinition.Physics,
                    },
                });
                if (associatedRuns.length > 0) {
                    await dataPass.addRuns(associatedRuns, { ignoreDuplicates: true });
                }
            };

            for (const monalisaDataPass of dataPasses) {
                await dataSource.transaction(() => transactionablePipeline(monalisaDataPass))
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
        const isLastRunNumberSame = dataPass.lastRunNumber && dataPass.lastRunNumber === dataPassesLastRunNumber[dataPass.name];
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
                attributes: [[sequelize.fn('max', sequelize.col('runs.run_number')), 'lastRunNumber']],
                through: { attributes: [] },
            }))
            .groupBy('name');

        const dataPassesWithLastStoredRunNumber = await DataPassRepository.findAll(queryBuilder);

        const lastRunNumbersEntries = dataPassesWithLastStoredRunNumber.map((lastRunData) => {
            const { name, 'runs.lastRunNumber': lastRunNumber } = lastRunData;
            return [name, lastRunNumber];
        });

        return Object.fromEntries(lastRunNumbersEntries);
    }

    /**
     * Synchronize with data from MonAlisa
     * Update Simulation Passes data in local DB
     * @return {Promise<void>} promise
     * @private
     */
    async _synchronizeSimulationPassesFromMonAlisa() {
        try {
            const simulationPasses = await this._monAlisaInterface.getSimulationPasses();
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
     * Update one Simulation Pass in DB with data fetched from MonAlisa
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

        const associatedRuns = await RunRepository.findAll({ where: {
            runNumber: { [Op.in]: runNumbers },
            definition: RunDefinition.Physics,
        } });
        if (associatedRuns.length > 0) {
            await simulationPassDB.addRuns(associatedRuns, { ignoreDuplicates: true });
        }
    }
}

exports.MonAlisaSynchronizer = MonAlisaSynchronizer;
