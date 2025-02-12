/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

const { LogManager } = require('@aliceo2/web-ui');
const { models: { ReasonType }, repositories: { RunRepository } } = require('../../../database');
const { runAdapter } = require('../../../database/adapters/index.js');
const { getRun } = require('./getRun.js');
const { createRun } = require('./createRun.js');
const { updateRun } = require('./updateRun.js');
const { getAllTagsByTextOrFail } = require('../tag/getAllTagsByTextOrFail.js');
const { getUserOrFail } = require('../user/getUserOrFail.js');
const { getOrCreateAllDataTakingDetectorsByName } = require('../detector/getOrCreateAllDataTakingDetectorsByName.js');
const { getOrCreateRunType } = require('../runType/getOrCreateRunType.js');
const { updateRunDetector } = require('../runDetector/updateRunDetector.js');
const { BadParameterError } = require('../../errors/BadParameterError.js');
const { createLog } = require('../log/createLog.js');
const { getTagsByText } = require('../tag/getTagsByText.js');
const { formatServerDate } = require('../../utilities/formatServerDate.js');
const { getRunOrFail } = require('./getRunOrFail.js');
const { getOrCreateLhcPeriod } = require('../lhcPeriod/getOrCreateLhcPeriod.js');
const ReasonTypeRepository = require('../../../database/repositories/ReasonTypeRepository.js');
const EorReasonRepository = require('../../../database/repositories/EorReasonRepository.js');
const { userService } = require('../user/UserService.js');
const { dataSource } = require('../../../database/DataSource.js');
const { RunDefinition } = require('../../../domain/enums/RunDefinition.js');
const { getEnvironment } = require('../environment/getEnvironment.js');
const { getEnvironmentOrFail } = require('../environment/getEnvironmentOrFail.js');
const { EnvironmentConfiguration } = require('../environment/EnvironmentConfiguration.js');
const { TriggerValue } = require('../../../domain/enums/TriggerValue.js');
const { flpRoleService } = require('../flp/FlpRoleService.js');

/**
 * @typedef RunIdentifier object to uniquely identify a run
 * @property {number} [runNumber] the run number
 * @property {number} [runId] the id of the run, ignored if runNumber is present
 */

/**
 * @typedef MagnetsCurrentLevels level of current for ALICE magnets
 * @param {number} l3
 * @param {number} dipole
 */

/**
 * @typedef GetOrCreateUserPayload object used to uniquely identify a user or create one if it do not exists yet
 * @property {UserIdentifier} userIdentifier the unique user identifier
 * @property {string|null} name the name of the user to create
 */

/**
 * @typedef RunRelationsToInclude object specifying which run relations should be fetched alongside the run
 * @property {boolean} [tags] if true, related tags will be fetched alongside the run
 * @property {boolean} [detectors] if true, related detectors will be fetched alongside the run
 * @property {boolean} [runType] if true, related run type will be fetched alongside the run
 * @property {boolean} [eorReasons] if true, related end of run reasons will be fetched alongside the run
 * @property {boolean} [flpRoles] if true, related flpRoles will be fetched alongside the run
 * @property {boolean} [lhcFill] if true, related lhcFill will be fetched alongside the run
 * @property {boolean} [environment] if true, related environment will be fetched alongside the run
 * @property {boolean} [lhcPeriod] if true, related LHC period will be fetched alongside the run
 * @property {boolean|{where: object}} [logs] if true, related logs will be fetched alongside the run
 */

/**
 * Categories of EoR reasons that needs to be logged
 *
 * If a run has an EoR reason with one of these categories, a log needs to be created
 *
 * @type {string[]}
 */
const EOR_REASON_CATEGORIES_TO_LOG = ['DETECTORS', 'DETECTOR'];

/**
 * Create a log stating the detector's quality change
 *
 * @param {number} runNumber the run number of the run
 * @param {SequelizeRunDetector[]} runDetectors the updated run detector
 * @param {Object} transaction the current transaction
 * @param {User|null} user if not null, the user mentioned in the log as the author of the update
 * @param {string} justification the justification of detector quality change
 * @return {Promise<void>} resolve when log has been created
 * @private
 */
const logRunDetectorQualityChange = async (runNumber, runDetectors, transaction, user, justification) => {
    const headerParts = [`Here are the updated detector's qualities for run ${runNumber}`];
    if (user) {
        headerParts.push(`by ${user.name}`);
    }
    headerParts.push(`(updated ${formatServerDate()}) :`);

    const tags = (await getTagsByText(runDetectors.map(({ detector }) => detector.name))).map(({ text }) => text);

    const textParts = [headerParts.join(' ')];
    for (const runDetector of runDetectors) {
        textParts.push(`- ${runDetector.detector.name}: ${runDetector.quality}`);
    }
    textParts.push(`Reason: ${justification}`);

    const { error } = await createLog(
        {
            title: `Detector(s) quality for run ${runNumber} has been changed`,
            text: textParts.join('\n'),
            subtype: 'run',
            origin: 'process',
        },
        [runNumber],
        tags,
        [],
        [],
        [],
        transaction,
    );
    if (error) {
        // TODO [O2B-967] log the failed log creation
    }
};

/**
 * Create a log to register run end of run reason
 *
 * @param {number} runNumber the run number of the run for which EoR reason has changed
 * @param {string} userName the username of the user that changed the EoR reason
 * @param {array<{category: string, title: string, description: string}>} eorReasons the new EoR reasons
 * @param {object|null} transaction optionally the transaction in which the log creation must be wrapped
 * @return {Promise<void>} resolves once the log has been created
 */
const logEorReasonChange = async (runNumber, userName, eorReasons, transaction) => {
    const { formatEorReason } = await import('../../../public/views/Runs/format/formatEorReason.mjs');

    const headerParts = [`End of run reason for the run ${runNumber} has been changed`];

    if (userName) {
        headerParts.push(`by ${userName}`);
    }

    // Use EoR reason's title as text, as it probably contains detector name
    const tags = (await getTagsByText(eorReasons.map(({ title }) => title))).map(({ text }) => text);

    const textParts = [`${headerParts.join(' ')}.`];

    textParts.push('The new EoR reasons are:');
    for (const eorReason of eorReasons) {
        textParts.push(`- ${formatEorReason(eorReason)}`);
    }

    const { error } = await createLog(
        {
            title: `EoR reason has changed for run ${runNumber}`,
            text: textParts.join('\n'),
            subtype: 'run',
            origin: 'process',
        },
        [runNumber],
        tags,
        [],
        [],
        [],
        transaction,
    );

    if (error) {
        // TODO [O2B-967] log the failed log creation
    }
};

/**
 * Global service to handle runs instances
 */
class RunService {
    /**
     * Constructor
     *
     * @param {Logger} logger a logger instance
     */
    constructor() {
        this._logger = LogManager.getLogger('RUN-SERVICE');
    }

    /**
     * Find and return a run by its run number or id
     *
     * @param {RunIdentifier} identifier the identifier of the run to find
     * @param {RunRelationsToInclude} [relations] the relations to include
     * @return {Promise<Run|null>} resolve with the run found or null
     */
    async get(identifier, relations) {
        const run = await getRun(identifier, (queryBuilder) => this._getRunQbConfiguration(queryBuilder, relations));
        return run ? runAdapter.toEntity(run) : null;
    }

    /**
     * Find and return a run by its run number or id, and throws a {@see NotFoundError} if no run is found
     *
     * @param {RunIdentifier} identifier the identifier of the run to find
     * @param {RunRelationsToInclude} [relations] the relations to include
     * @return {Promise<Run>} resolve with the run found or null
     * @throws {NotFoundError} if no run is found
     */
    async getOrFail(identifier, relations) {
        return runAdapter.toEntity(await getRunOrFail(
            identifier,
            (queryBuilder) => this._getRunQbConfiguration(queryBuilder, relations),
        ));
    }

    /**
     * Get or create a run by its run number, using environment info if it applies
     *
     * @param {number} runNumber the run number of the run to create
     * @param {string} environmentId the id of the environment containing the run
     * @param {Partial<Run>} [partialRun] optional runs properties to define
     * @param {Object} [relations] run relations to create/update
     * @param {GetOrCreateUserPayload} [relations.userO2Start] if not null, the identifier of the user that started the run
     * @param {GetOrCreateUserPayload} [relations.userO2Stop] if not null, the identifier of the user that stopped the run
     * @return {Promise<Run>} resolves with the run
     */
    createOrUpdate(runNumber, environmentId, partialRun, relations) {
        return dataSource.transaction(async () => {
            // If the given environment do not exist we consider that it should not be stored in database, and same for the runs related to it
            if (!await getEnvironment(environmentId)) {
                return;
            }

            const existingRun = await getRun({ runNumber });

            if (existingRun) {
                await this.update({ runNumber }, { runPatch: partialRun, relations });
            } else {
                const { rawConfiguration } = await getEnvironmentOrFail(environmentId);

                let runDataFromConfiguration = {};
                let flpRoles = [];
                if (rawConfiguration) {
                    try {
                        const configuration = new EnvironmentConfiguration(JSON.parse(rawConfiguration));
                        const { partialRun, relations: extractedRelations } = this._extractRunDataFromEnvironmentConfiguration(
                            configuration,
                            (e) => this._logger.errorMessage(e.message, { environmentId, runNumber }),
                        );
                        runDataFromConfiguration = partialRun;
                        const { hosts, runTypeName, lhcPeriodName } = extractedRelations;
                        flpRoles = hosts.map((host) => ({ name: host, hostname: host, runNumber }));
                        relations.runTypeName = runTypeName;
                        relations.lhcPeriodName = lhcPeriodName;
                    } catch (e) {
                        this._logger.errorMessage(e.message, { environmentId, runNumber });
                    }
                }

                return await this.create({
                    ...partialRun,
                    runNumber,
                    environmentId,
                    ...runDataFromConfiguration,
                }, { ...relations, flpRoles });
            }
        });
    }

    /**
     * Create a run in the database and return the created instance
     *
     * @param {Partial<Run>} newRun the run to create
     * @param {Object} [relations={}] the run's relations
     * @param {string|null} [relations.runTypeName=null] if not null, the name of the created run's type
     * @param {string|null} [relations.lhcPeriodName=null] if not null, the name of lhc period for which the run should be assigned
     * @param {GetOrCreateUserPayload|null} [relations.userO2Start=null] if not null, the identifier of the user that started the run
     * @param {GetOrCreateUserPayload|null} [relations.userO2Stop=null] if not null, the identifier of the user that stopped the run
     * @return {Promise<Run>} resolve with the created run instance
     */
    async create(newRun, relations) {
        const { runTypeName = null, lhcPeriodName = null, userO2Start = null, userO2Stop = null, flpRoles } = relations || {};

        return dataSource.transaction(async () => {
            const detectors = newRun.detectors
                ? await getOrCreateAllDataTakingDetectorsByName(newRun.detectors.split(',').map((value) => value.trim()))
                : null;

            let runType = null;
            if (runTypeName) {
                runType = await getOrCreateRunType({ name: runTypeName });
            }

            if (lhcPeriodName) {
                const lhcPeriod = await getOrCreateLhcPeriod({ name: lhcPeriodName });
                newRun.lhcPeriodId = lhcPeriod.id;
            }

            // Update the users for the run
            if (userO2Start) {
                newRun.userIdO2Start = (await userService.getOrCreate(userO2Start.userIdentifier, userO2Start.name)).id;
            }
            if (userO2Stop) {
                newRun.userIdO2Stop = (await userService.getOrCreate(userO2Stop.userIdentifier, userO2Stop.name)).id;
            }

            const runId = await createRun(runAdapter.toDatabase(newRun), { detectors, runType });

            if (flpRoles) {
                for (const flpRole of flpRoles) {
                    await flpRoleService.create(flpRole);
                }
            }

            return this.get({ runId }, { runType: true, detectors: true, lhcPeriod: true, flpRoles });
        });
    }

    /**
     * Update the given run
     *
     * @param {RunIdentifier} identifier the identifier of the run to update
     * @param {object} payload the update's payload
     * @param {Partial<Run>} [payload.runPatch] the patch to apply on the run
     * @param {object} [payload.metadata] optional run update's metadata
     * @param {string} [payload.metadata.runQualityChangeReason] if it applies, the reason of the calibration change
     * @param {string} [payload.metadata.calibrationStatusChangeReason] if it applies, the reason of the calibration change
     * @param {string} [payload.metadata.detectorsQualitiesChangeReason] if it applies, the reason of the detector quality change
     * @param {Object} [payload.relations] updates to the run's relations
     * @param {string[]|null} [payload.relations.tagsTexts] if not null, the list of tag texts representing tags to apply to the run (will
     *     replace existing ones)
     * @param {EorReason[]|null} [payload.relations.eorReasons] if not null, the list of end of run reasons to apply to the run (will replace
     *     existing ones)
     * @param {string|null} [payload.relations.runTypeName] if not null, the name of the updated run type
     * @param {UserIdentifier} [payload.relations.userIdentifier] if not null, the identifier of the user requesting the run update
     * @param {{detectorId: number, quality: string}[]} [payload.relations.detectorsQualities] an optional list representing the new quality of
     *     the run's detector (the run must be related to the given detector, the detectors not in this list keep their original quality)
     * @param {GetOrCreateUserPayload|null} [payload.relations.userO2Start=null] if not null, the identifier of the user that started the run
     * @param {GetOrCreateUserPayload|null} [payload.relations.userO2Stop=null] if not null, the identifier of the user that stopped the run
     * @param {string} [payload.relations.lhcPeriodName] if not null, the name of lhc period for which the run should be assigned
     * @return {Promise<Run>} resolve with the resulting run
     */
    async update(identifier, payload) {
        const { runPatch = {}, relations = {}, metadata = {} } = payload;
        const {
            tagsTexts = null, eorReasons = null, runTypeName = null,
            userIdentifier = {}, detectorsQualities = [], lhcPeriodName = null,
            userO2Start = null, userO2Stop = null,
        } = relations;

        const tags = tagsTexts ? await getAllTagsByTextOrFail(tagsTexts, true) : null;

        if (runTypeName) {
            const runType = await getOrCreateRunType({ name: runTypeName });
            runPatch.runTypeId = runType.id;
        }

        if (lhcPeriodName) {
            const lhcPeriod = await getOrCreateLhcPeriod({ name: lhcPeriodName });
            runPatch.lhcPeriodId = lhcPeriod.id;
        }

        let user = null;
        if (userIdentifier.userId !== undefined || userIdentifier.externalUserId !== undefined) {
            user = await getUserOrFail(userIdentifier);
        }

        // Update the users for the run
        if (userO2Start) {
            runPatch.userIdO2Start = (await userService.getOrCreate(userO2Start.userIdentifier, userO2Start.name)).id;
        }
        if (userO2Stop) {
            runPatch.userIdO2Stop = (await userService.getOrCreate(userO2Stop.userIdentifier, userO2Stop.name)).id;
        }

        await dataSource.transaction(async (transaction) => {
            const run = await updateRun(
                identifier,
                { runPatch: runAdapter.toDatabase(runPatch), relations: { tags, user }, metadata },
                transaction,
            );

            // Update EOR reasons if they are provided
            if (eorReasons) {
                await updateEorReasonsOnRun(run.id, run.runNumber, user?.name, eorReasons, transaction);
            }

            // Update detector qualities if they are provided
            if (detectorsQualities.length > 0) {
                const { detectorsQualitiesChangeReason } = metadata;
                if (!(run.timeTrgEnd ?? run.timeO2End)) {
                    throw new BadParameterError('Detector quality can not be updated on a run that has not ended yet');
                }
                if (!detectorsQualitiesChangeReason) {
                    throw new BadParameterError('Detector quality change reason is required when updating detector quality');
                }

                const updatedRunDetectors = [];
                for (const detectorsQuality of detectorsQualities) {
                    updatedRunDetectors.push(await updateRunDetector(
                        run.runNumber,
                        detectorsQuality.detectorId,
                        { quality: detectorsQuality.quality },
                        transaction,
                    ));
                }

                await logRunDetectorQualityChange(run.runNumber, updatedRunDetectors, transaction, user, detectorsQualitiesChangeReason);
            }
        });

        return this.get(identifier, { tags: true, runType: true, detectors: true, eorReasons: true, lhcPeriod: true });
    }

    /**
     * Configure the given query builder to include the provided relations
     *
     * @param {QueryBuilder} queryBuilder the query builder to complete for relations
     * @param {RunRelationsToInclude} [relations] the relations to include
     * @return {void}
     * @private
     */
    _getRunQbConfiguration(queryBuilder, relations) {
        relations = relations || {};
        if (relations.tags) {
            queryBuilder.include('tags');
        }
        if (relations.detectors) {
            queryBuilder.include('detectors');
        }
        if (relations.runType) {
            queryBuilder.include('runType');
        }
        if (relations.eorReasons) {
            queryBuilder.include({ association: 'eorReasons', include: { model: ReasonType, as: 'reasonType' } });
        }
        if (relations.flpRoles) {
            queryBuilder.include('flpRoles');
        }
        if (relations.lhcFill) {
            queryBuilder.include('lhcFill');
        }
        if (relations.lhcPeriod) {
            queryBuilder.include('lhcPeriod');
        }
    }

    /**
     * Calculate distinct combination of levels of alice L3 and dipole current rounded to kilo amperes
     *
     * @return {MagnetsCurrentLevels[]} distinct combination list
     */
    async getAllAliceL3AndDipoleLevelsForPhysicsRuns() {
        const queryBuilder = dataSource.createQueryBuilder()
            .set('attributes', (sequelize) => [
                [sequelize.literal('DISTINCT ROUND(IF(alice_l3_polarity = \'NEGATIVE\', -1, 1) * alice_l3_current / 1000)'), 'l3Level'],
                [sequelize.literal('ROUND(IF(alice_dipole_polarity = \'NEGATIVE\', -1, 1) * alice_dipole_current / 1000)'), 'dipoleLevel'],
            ])
            .where('aliceL3Current').not().is(null)
            .where('aliceL3Polarity').not().is(null)
            .where('aliceDipoleCurrent').not().is(null)
            .where('aliceDipolePolarity').not().is(null)
            .where('definition').is(RunDefinition.PHYSICS);

        return (await RunRepository
            .findAll(queryBuilder))
            .map((row) => ({ l3: row.get('l3Level'), dipole: row.get('dipoleLevel') }));
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * Extract partial run information from a given environment configuration
     *
     * @param {EnvironmentConfiguration} configuration the environment configuration to parse
     * @param {(error: Error) => void} onError handler of errors
     * @return {{partialRun: Partial<Run>, relations: {hosts: string}}} the partial run
     */
    _extractRunDataFromEnvironmentConfiguration(configuration, onError) {
        const partialRun = {};

        let detectors = [];
        try {
            detectors = configuration.getArray('detectors');
        } catch (e) {
            onError(e);
        }
        let hosts = [];
        try {
            hosts = configuration.getArray('hosts');

            /*
             * If the run has CTP readout enabled, we need to add the CTP host in the list of hosts
             * The reason is that hosts is defined manually using AliECS GUI to have fine grained control over enabled FLPs, but CTP readout is
             * a boolean which runs automatically on a dedicated host
             */
            const ctp_readout_enabled = configuration.getBool('ctp_readout_enabled');
            if (ctp_readout_enabled) {
                const ctp_readout_host = configuration.getString('ctp_readout_host');
                if (ctp_readout_host) {
                    hosts.push(ctp_readout_host);
                }
            }
        } catch (e) {
            onError(e);
        }

        const runTypeName = configuration.getString('run_type');
        const lhcPeriodName = configuration.getString('lhc_period');

        let ctp = false;
        try {
            ctp = configuration.getBool('trg_global_run_enabled');
        } catch (e) {
            onError(e);
        }

        let triggerEnabled = false;
        try {
            triggerEnabled = configuration.getBool('trg_enabled');
        } catch (e) {
            onError(e);
        }

        let triggerValue = TriggerValue.Off;
        if (triggerEnabled) {
            triggerValue = ctp ? TriggerValue.CTP : TriggerValue.LTU;
        }
        partialRun.triggerValue = triggerValue;

        partialRun.detectors = detectors.join(',');
        partialRun.nDetectors = detectors?.length ?? 0;

        try {
            partialRun.dd_flp = configuration.getBool('dd_enabled');
        } catch (e) {
            onError(e);
        }
        try {
            partialRun.dcs = configuration.getBool('dcs_enabled');
        } catch (e) {
            onError(e);
        }
        try {
            partialRun.epn = configuration.getBool('odc_enabled');
        } catch (e) {
            onError(e);
        }

        partialRun.pdpConfigOption = configuration.getString('pdp_config_option');
        partialRun.pdpTopologyDescriptionLibraryFile = configuration.getString('pdp_topology_description_library_file');
        partialRun.pdpWorkflowParameters = configuration.getString('pdp_workflow_parameters');
        partialRun.tfbDdMode = configuration.getString('tfb_dd_mode');
        partialRun.odcTopologyFullName = configuration.getString('odc_topology_fullname');
        partialRun.pdpBeamType = configuration.getString('pdp_beam_type');
        partialRun.epnTopology = configuration.getString('odc_topology');
        partialRun.nEpns = configuration.getString('odc_n_epns');
        partialRun.nFlps = hosts?.length ?? 0;
        partialRun.readoutCfgUri = configuration.getString('readout_cfg_uri');

        return {
            partialRun,
            relations: { hosts: hosts ?? [], runTypeName, lhcPeriodName },
        };
    }
}

// eslint-disable-next-line valid-jsdoc
/**
 * Update the EoR reasons of a given run
 *
 * @param {number} runId - id of the run that is due to be modified
 * @param {number} runNumber - run number of the run that is due to be modified
 * @param {string} userName - name of the user editing the EOR reasons
 * @param {EorReasonPatch[]} eorReasonsPatches - full list of EoR reasons to apply on the run (any existing EoR reason not in the list will be
 *                                              removed)
 * @param {import('sequelize').Transaction} [transaction] optional transaction in which operations must be wrapped
 * @returns {Promise<undefined|Error>} - promise on result of db queries
 */
const updateEorReasonsOnRun = async (runId, runNumber, userName, eorReasonsPatches, transaction) => {
    const reasonTypes = await ReasonTypeRepository.findAll();
    const idsOfReasonTypesToLog = [];

    /**
     * @type {Map<number|string, SequelizeReasonType>}
     */
    const reasonTypesMap = new Map();
    for (const reasonType of reasonTypes) {
        // Index the reason type by its id
        reasonTypesMap.set(reasonType.id, reasonType);
        // Index the reason type by its category and title
        reasonTypesMap.set(JSON.stringify([reasonType.category, reasonType.title]), reasonType);

        if (EOR_REASON_CATEGORIES_TO_LOG.includes(reasonType.category.toUpperCase())) {
            idsOfReasonTypesToLog.push(reasonType.id);
        }
    }

    /**
     * @type {SequelizeEorReason[]}
     */
    const eorReasons = [];
    for (const eorReasonPatch of eorReasonsPatches) {
        // Use reasonTypeId if it exists, otherwise use category+title if it exists to get the reasonTypeId
        const reasonTypeKey = eorReasonPatch.reasonTypeId ?? JSON.stringify([eorReasonPatch.category, eorReasonPatch.title]);
        const reasonType = reasonTypesMap.get(reasonTypeKey) ?? null;
        // Add to the eorReasons array if valid, if the patch is invalid ignore it
        if (reasonType !== null) {
            // Set the reasonTypeId for further processing
            eorReasons.push({
                id: eorReasonPatch.id,
                reasonTypeId: reasonType.id,
                description: eorReasonPatch.description,
            });
        }
    }

    /**
     * @type {number[]}
     */
    const toKeepEorReasonsIds = []; // EorReasons with an ID already, means exist in DB;

    /**
     * @type {Partial<SequelizeEorReason>[]}
     */
    const newEorReasons = []; // EorReasons with no ID, need to be added in DB;
    let needLoggingForEorReason = false;
    eorReasons.forEach(({ id, reasonTypeId, description }) => {
        if (id) {
            toKeepEorReasonsIds.push(id);
        } else {
            newEorReasons.push({ runId, reasonTypeId, description, lastEditedName: userName });

            if (idsOfReasonTypesToLog.includes(reasonTypeId)) {
                needLoggingForEorReason = true;
            }
        }
    });

    await EorReasonRepository.removeByRunIdAndKeepIds(runId, toKeepEorReasonsIds);
    await EorReasonRepository.addMany(newEorReasons);

    if (needLoggingForEorReason) {
        await logEorReasonChange(
            runNumber,
            userName,
            eorReasons.map(({ reasonTypeId, description }) => {
                const eorReasonType = reasonTypesMap.get(reasonTypeId) ?? {};
                return { category: eorReasonType.category, title: eorReasonType.title, description };
            }),
            transaction,
        );
    }
};

exports.RunService = RunService;

exports.runService = new RunService();
