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
const { repositories: {
    DataPassRepository, DataPassVersionRepository, RunRepository, SimulationPassRepository,
} } = require('../../database/index.js');
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
            const dataPassVersionsLastSeen = await this._getAllDataPassVersionsLastSeen();
            const monAlisaDataPassesVersions = (await this._monAlisaInterface.getDataPassesVersions())
                .filter((monalisaDataPassVersion) => this._doesDataPassVersionNeedUpdate(monalisaDataPassVersion, dataPassVersionsLastSeen));

            const errorMessageToDataPassesNames = new Map();

            for (const monalisaDataPassVersion of monAlisaDataPassesVersions) {
                try {
                    await this._updateOneDataPassVersion(monalisaDataPassVersion);
                } catch (error) {
                    if (!errorMessageToDataPassesNames.has(error.message)) {
                        errorMessageToDataPassesNames.set(error.message, []);
                    }
                    errorMessageToDataPassesNames.get(error.message).push(monalisaDataPassVersion.name);
                }
            }

            if (errorMessageToDataPassesNames.size > 0) {
                const stackedErrorMessage = [...errorMessageToDataPassesNames.entries()]
                    .map(([errorMessage, dataPassesList]) => `Error for data passes (${dataPassesList.join(',')}):\n${errorMessage}`)
                    .join('\n');

                this.logger.errorMessage(stackedErrorMessage, {});
            }
            this.logger.debug('Synchronization of Data Passes completed');
        } catch (error) {
            this.logger.errorMessage(`Fatal error preventing synchronization of DataPasses: ${error.message}`, {});
        }
    }

    /**
     * Update one Data Pass in DB with data fetched from MonAlisa
     * @param {MonAlisaDataPassVersion} monalisaDataPassVersion data pass properties and its associations
     * @return {Promise<void>} promise
     * @private
     */
    async _updateOneDataPassVersion(monalisaDataPassVersion) {
        return dataSource.transaction(async () => {
            const lhcPeriodDB = await getOrCreateLhcPeriod({ name: extractLhcPeriod(monalisaDataPassVersion.name).name });

            const { name: dataPassName, ...dataPassVersion } = monalisaDataPassVersion;

            const dataPass = await DataPassRepository.findOneOrCreate({ name: dataPassName, lhcPeriodId: lhcPeriodDB.id });

            await DataPassVersionRepository.upsert({ dataPassId: dataPass.id, ...dataPassVersion });

            const { runNumbers } = await this._monAlisaInterface.getDataPassVersionDetails(dataPassVersion.description);
            const associatedRuns = await RunRepository.findAll({
                where: {
                    runNumber: { [Op.in]: runNumbers },
                    definition: RunDefinition.Physics,
                },
            });
            if (associatedRuns.length > 0) {
                await dataPass.addRuns(associatedRuns, { ignoreDuplicates: true });
            }
        });
    }

    /**
     * Check wether data pass needs to be updated
     * @param {MonAlisaDataPass} dataPass data pass
     * @param {Object<string, Object<string, number>>} dataPassesLastSeen mapping:
     *  data pass name -> data pass version description -> its last_seen
     * @return {boolean} true if it is needed to update the data pass
     * @private
     */
    _doesDataPassVersionNeedUpdate({ name, description, lastSeen }, dataPassesLastSeen) {
        const isLastSeenSame = lastSeen && lastSeen === dataPassesLastSeen?.[name]?.[description];
        return !isLastSeenSame;
    }

    /**
     * Fetch last_seen information telling whether some data pass must be updated
     * @return {Object<string, number>} mapping data pass name -> its last_seen value
     * @private
     */
    async _getAllDataPassVersionsLastSeen() {
        const dataPassesLastSeen = await DataPassRepository.findAll({
            attributes: ['name'],
            include: [{ association: 'versions', attributes: ['description', 'lastSeen'] }],
        });

        return Object.fromEntries(dataPassesLastSeen
            .map(({ name, versions }) => [
                name,
                Object.fromEntries(versions.map(({ description, lastSeen }) => [description, lastSeen])),
            ]));
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
                try {
                    await this._updateOneSimulationPass(simulationPass);
                } catch (error) {
                    this.logger.errorMessage(`Error for ${simulationPass.properties.name}: ${error.message}`, {});
                }
            }
            this.logger.debug('Synchronization of Simulation Passes completed');
        } catch (error) {
            this.logger.errorMessage(error.message, {});
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
        return dataSource.transaction(async () => {
            const { properties: simulationPassProperties,
                associations: { lhcPeriods, dataPassesSuffixes, runNumbers } } = simulationPassData;

            const dataPassesNames = lhcPeriods.flatMap((lhcPeriod) => dataPassesSuffixes.map((suffix) => `${lhcPeriod}_${suffix}`));
            const associatedDataPasses = await DataPassRepository.findAll({ where: { name: { [Op.in]: dataPassesNames } } });
            if (associatedDataPasses.length === 0) {
                throw new Error(`There is no data passes in DB which are associated to ${simulationPassProperties.name}`);
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
        });
    }
}

exports.MonAlisaSynchronizer = MonAlisaSynchronizer;
