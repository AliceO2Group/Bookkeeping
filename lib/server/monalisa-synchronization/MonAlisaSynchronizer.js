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

const { LogManager } = require('@aliceo2/web-ui');
const { dataSource } = require('../../database/DataSource.js');
const { repositories: {
    DataPassRepository, DataPassVersionRepository, RunRepository, SimulationPassRepository,
} } = require('../../database/index.js');
const { extractLhcPeriod } = require('../utilities/extractLhcPeriod.js');
const { getOrCreateLhcPeriod } = require('../services/lhcPeriod/getOrCreateLhcPeriod.js');
const { Op } = require('sequelize');
const { RunDefinition } = require('../../domain/enums/RunDefinition.js');
const { SkimmingStage } = require('../../domain/enums/SkimmingStage.js');

const SKIMMING_DATA_PASS_NAME_REGEX = /skimming/;
const SKIMMED_DATA_PASS_NAME_REGEX = /pass.*_skimmed/;

/**
 * Manger of synchronization with MonAlisa
 */
class MonAlisaSynchronizer {
    /**
     * Constructor
     * @param {MonAlisaClient} monAlisaClient interface with MonAlisa
     */
    constructor(monAlisaClient) {
        this._logger = LogManager.getLogger(MonAlisaSynchronizer.name);
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
            const descriptionToLastSeenAndId = await this._getAllDataPassVersionsLastSeenAndId();
            const allMonAlisaDataPassesVersions = await this._monAlisaInterface.getDataPassesVersions();
            const monAlisaDataPassesVersionsToBeUpdated = allMonAlisaDataPassesVersions
                .filter((monalisaDataPassVersion) => this._doesDataPassVersionNeedUpdate(monalisaDataPassVersion, descriptionToLastSeenAndId))
                .sort(({ name: name1 }, { name: name2 }) => name1.localeCompare(name2));

            const errorMessageToDataPassesNames = new Map();

            for (const monalisaDataPassVersion of monAlisaDataPassesVersionsToBeUpdated) {
                try {
                    await this._updateOneDataPassVersion(monalisaDataPassVersion);
                } catch (error) {
                    if (!errorMessageToDataPassesNames.has(error.message)) {
                        errorMessageToDataPassesNames.set(error.message, []);
                    }
                    errorMessageToDataPassesNames.get(error.message).push(monalisaDataPassVersion.name);
                }
            }

            await this._updateDeletedDataPassVersions(descriptionToLastSeenAndId, allMonAlisaDataPassesVersions);

            if (errorMessageToDataPassesNames.size > 0) {
                const stackedErrorMessage = [...errorMessageToDataPassesNames.entries()]
                    .map(([errorMessage, dataPassesList]) => `Error for data passes (${dataPassesList.join(',')}):\n${errorMessage}`)
                    .join('\n');

                this._logger.errorMessage(stackedErrorMessage, {});
            }
            this._logger.debugMessage('Synchronization of Data Passes completed');
        } catch (error) {
            this._logger.errorMessage(`Fatal error preventing synchronization of DataPasses: ${error.message}`, {});
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

            const skimmingStage = await this._getSkimmingStage(dataPassName, lhcPeriodDB.id);
            const dataPass = await DataPassRepository.findOneOrCreate({ name: dataPassName, lhcPeriodId: lhcPeriodDB.id, skimmingStage });
            await DataPassVersionRepository.upsert({ dataPassId: dataPass.id, ...dataPassVersion });
            const { runNumbers } = await this._monAlisaInterface.getDataPassVersionDetails(dataPassVersion.description);
            const associatedRuns = await RunRepository.findAll({
                where: {
                    runNumber: { [Op.in]: runNumbers },
                    definition: RunDefinition.PHYSICS,
                },
            });
            if (associatedRuns.length > 0) {
                await dataPass.addRuns(associatedRuns, { ignoreDuplicates: true });
            }
        });
    }

    /**
     * Return name of skimming stage if it applies to given data pass
     *
     * @param {string} dataPassName name of data pass
     * @param {number} lhcPeriodId id of LHC period which the data pass belongs to
     * @return {string} name of skimming stage
     */
    async _getSkimmingStage(dataPassName, lhcPeriodId) {
        if (SKIMMING_DATA_PASS_NAME_REGEX.test(dataPassName)) {
            return SkimmingStage.SKIMMING;
        }

        if (SKIMMED_DATA_PASS_NAME_REGEX.test(dataPassName)) {
            const existingSkimmedPass = await DataPassRepository.findOne({ where: { lhcPeriodId, skimmingStage: SkimmingStage.SKIMMED } });
            if (existingSkimmedPass) {
                return SkimmingStage.POST_SKIMMED;
            } else {
                return SkimmingStage.SKIMMED;
            }
        }

        return null;
    }

    /**
     * Check wether data pass needs to be updated
     * @param {MonAlisaDataPass} dataPass data pass
     * @param {Object<string, { lastSeen: number, id: number }>} descriptionToLastSeenAndId mapping:
     * data pass version description to it's properties subset
     * @return {boolean} true if it is needed to update the data pass
     * @private
     */
    _doesDataPassVersionNeedUpdate({ description, lastSeen }, descriptionToLastSeenAndId) {
        const isLastSeenSame = lastSeen && lastSeen === descriptionToLastSeenAndId[description]?.lastSeen;
        return !isLastSeenSame;
    }

    /**
     * Fetch id and last_seen information of data pass versions that have not been deleted
     *  telling whether some data pass version must be updated
     * @return {Object<string, { lastSeen: number, id: number }>} mapping:
     * data pass version description to it's properties subset
     * @private
     */
    async _getAllDataPassVersionsLastSeenAndId() {
        const dataPassesLastSeen = await DataPassVersionRepository.findAll({
            attributes: ['id', 'description', 'lastSeen'],
            where: { deletedFromMonAlisa: false },
        });

        return Object.fromEntries(dataPassesLastSeen.map(({ description, lastSeen, id }) => [description, { lastSeen, id }]));
    }

    /**
     * Mark data passes versions as deleted from MonALISA
     *
     * @param {Object<string, { lastSeen: number, id: number }>} descriptionToLastSeenAndId mapping:
     * data pass version description to it's properties subset
     * @param {MonAlisaDataPassVersion[]} allMonAlisaDataPassesVersions all data pass versions fetched from MonALISA
     * @return {Promise<void>} resolved once all data passes versions deleted from MonALISA are updated as such
     */
    async _updateDeletedDataPassVersions(descriptionToLastSeenAndId, allMonAlisaDataPassesVersions) {
        const allDBDataPassesVersionsDescriptions = Object.keys(descriptionToLastSeenAndId);

        const allFetchedDataPassesVersionsDescriptions = new Set(allMonAlisaDataPassesVersions.map(({ description }) => description));
        const deletedDataPassesVersionsDescriptions =
            allDBDataPassesVersionsDescriptions.filter((description) => !allFetchedDataPassesVersionsDescriptions.has(description));

        const deletedDataPassesVersionsIds =
            deletedDataPassesVersionsDescriptions.map((description) => descriptionToLastSeenAndId[description].id);

        await DataPassVersionRepository.updateAll(
            { deletedFromMonAlisa: true },
            { where: { id: { [Op.in]: deletedDataPassesVersionsIds } } },
        );
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
                    this._logger.errorMessage(`Error for ${simulationPass.properties.name}: ${error.message}`, {});
                }
            }
            this._logger.debugMessage('Synchronization of Simulation Passes completed');
        } catch (error) {
            this._logger.errorMessage(error.message, {});
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
                definition: RunDefinition.PHYSICS,
            } });
            if (associatedRuns.length > 0) {
                await simulationPassDB.addRuns(associatedRuns, { ignoreDuplicates: true });
            }
        });
    }
}

exports.MonAlisaSynchronizer = MonAlisaSynchronizer;
