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

const { repositories: { QcFlagRepository, DplDetectorRepository, RunRepository } } = require('../../../database/index.js');
const { dataSource } = require('../../../database/DataSource.js');
const { qcFlagAdapter } = require('../../../database/adapters/index.js');
const { BadParameterError } = require('../../errors/BadParameterError.js');
const { NotFoundError } = require('../../errors/NotFoundError.js');
const { getUserOrFail } = require('../user/getUserOrFail.js');
const { AccessDeniedError } = require('../../errors/AccessDeniedError.js');
const { BkpRoles } = require('../../../domain/enums/BkpRoles.js');

const NON_QC_DETECTORS = new Set(['TST']);

/**
 * @typedef UserWithRoles
 * @property {number} userId
 * @property {number} externalUserId
 * @property {string[]} roles
 */

/**
 * Quality control flags service
 */
class QcFlagService {
    /**
     * Find an Quality Control Flag by its id
     * @param {number} id identifier of Quality Control Flag
     * @return {QcFlag} a Quality Control Flag
     */
    async getById(id) {
        const queryBuilder = this.prepareQueryBuilder();
        if (!id) {
            throw new BadParameterError('Can not find without Quality Control Flag id');
        }

        queryBuilder.where('id').is(id);

        const qcFlag = await QcFlagRepository.findOne(queryBuilder);
        return qcFlag ? qcFlagAdapter.toEntity(qcFlag) : null;
    }

    /**
     * Find an Quality Control Flag by its id
     * @param {number} id id of Quality Control Flag
     * @throws {NotFoundError} in case there is no Quality Control Flag with given id
     * @return {Promise<QcFlag>} a Quality Control Flag
     */
    async getOneOrFail(id) {
        const qcFlag = await this.getById(id);
        if (!qcFlag) {
            const criteriaExpression = `id (${id})`;
            throw new NotFoundError(`Quality Control Flag with this ${criteriaExpression} could not be found`);
        }
        return qcFlag;
    }

    /**
     * Validate QC flag timestamps
     * If null timestamp was provided, given timestamp is replaced by run's startTime or endTime
     * @param {{from: number, to: number}} timestamps QC flag timestamps
     * @param {Run} targetRun run which for QC flag is to be set
     * @throws {BadParameterError}
     * @return {{fromTime: number, toTime: number}} prepared timestamps
     */
    _prepareQcFlagPeriod({ from, to }, targetRun) {
        const fromTime = from ?? targetRun.startTime;
        const toTime = to ?? targetRun.endTime;

        if (!fromTime || !toTime) {
            if (!fromTime && !toTime) {
                return { fromTime: null, toTime: null };
            } else {
                throw new BadParameterError('Only null QC flag timestamps are accepted as run.startTime or run.endTime is missing');
            }
        }

        if (fromTime >= toTime) {
            throw new BadParameterError('Parameter "to" timestamp must be greater than "from" timestamp');
        }

        if (fromTime < targetRun.startTime || targetRun.endTime < toTime) {
            // eslint-disable-next-line max-len
            throw new BadParameterError(`Given QC flag period (${fromTime}, ${toTime}) is out of run (${targetRun.startTime}, ${targetRun.endTime}) period`);
        }
        return { fromTime, toTime };
    }

    /**
     * Validate QC flag DPL detector
     * @param {number} dplDetectorId DPL detector
     * @throws {BadParameterError}
     * @return {void}
     */
    async _validateQcFlagDplDetector(dplDetectorId) {
        const dplDetector = await DplDetectorRepository.findOne({ where: { id: dplDetectorId } });
        if (!dplDetector?.name || NON_QC_DETECTORS.has(dplDetector.name)) {
            throw new BadParameterError(`Invalid DPL detector (${dplDetector.name})`);
        }
        return dplDetector;
    }

    /**
     * Create new instance of quality control flags for data pass
     * @param {Partial<QcFlag>} parameters flag instance parameters
     * @param {object} [relations] QC Flag Type entity relations
     * @param {Partial<UserIdentifier>} [relations.user] user identifiers
     * @param {number} [parameters.flagTypeId] flag type id
     * @param {number} [parameters.runNumber] associated run's number
     * @param {number} [parameters.dataPassId] associated dataPass' id
     * @param {number} [parameters.dplDetectorId] associated dplDetector's id
     * @return {Promise<QcFlag>} promise
     * @throws {BadParameterError, NotFoundError}
     */
    async createForDataPass(parameters, relations = {}) {
        const {
            from = null,
            to = null,
            comment,
        } = parameters;
        const {
            user: { userId, externalUserId } = {},
            flagTypeId,
            runNumber,
            dataPassId,
            dplDetectorId,
        } = relations;

        return dataSource.transaction(async () => {
            // Check user
            const user = await getUserOrFail({ userId, externalUserId });

            // Check associations
            const dplDetector = await this._validateQcFlagDplDetector(dplDetectorId);

            const targetRun = await RunRepository.findOne({
                subQuery: false,
                attributes: ['timeTrgStart', 'timeTrgEnd'],
                where: { runNumber },
                include: [
                    {
                        association: 'dataPass',
                        where: { id: dataPassId },
                        through: { attributes: [] },
                        attributes: ['id'],
                        required: true,
                    },
                    {
                        association: 'detectors',
                        where: { name: dplDetector.name },
                        through: { attributes: [] },
                        attributes: [],
                        required: true,
                    },
                ],
            });
            if (!targetRun) {
                // eslint-disable-next-line max-len
                throw new BadParameterError(`There is not association between data pass with this id (${dataPassId}), run with this number (${runNumber}) and detector with this name (${dplDetector.name})`);
            }

            const { fromTime, toTime } = this._prepareQcFlagPeriod({ from, to }, targetRun);

            // Insert
            const newInstance = await QcFlagRepository.insert({
                from: fromTime,
                to: toTime,
                comment,
                createdById: user.id,
                flagTypeId,
                runNumber,
                dplDetectorId,
            });

            const createdFlag = await QcFlagRepository.findOne(this.prepareQueryBuilder().where('id').is(newInstance.id));

            await createdFlag.addDataPasses(targetRun.dataPass);

            return qcFlagAdapter.toEntity(createdFlag);
        });
    }

    /**
     * Create new instance of quality control flags for simulation pass
     * @param {Partial<QcFlag>} parameters flag instance parameters
     * @param {object} [relations] QC Flag entity relations
     * @param {Partial<UserIdentifier>} [relations.user] user identifiers
     * @param {number} [parameters.flagTypeId] flag type id
     * @param {number} [parameters.runNumber] associated run's number
     * @param {number} [parameters.simulationPassId] associated simulationPass' id
     * @param {number} [parameters.dplDetectorId] associated dplDetector's id
     * @return {Promise<QcFlag>} promise
     * @throws {BadParameterError, NotFoundError}
     */
    async createForSimulationPass(parameters, relations = {}) {
        const {
            from = null,
            to = null,
            comment,
        } = parameters;
        const {
            user: { userId, externalUserId } = {},
            flagTypeId,
            runNumber,
            simulationPassId,
            dplDetectorId,
        } = relations;

        return dataSource.transaction(async () => {
            // Check user
            const user = await getUserOrFail({ userId, externalUserId });

            // Check associations
            const dplDetector = await this._validateQcFlagDplDetector(dplDetectorId);

            const targetRun = await RunRepository.findOne({
                subQuery: false,
                attributes: ['timeTrgStart', 'timeTrgEnd'],
                where: { runNumber },
                include: [
                    {
                        association: 'simulationPasses',
                        where: { id: simulationPassId },
                        through: { attributes: [] },
                        attributes: ['id'],
                        required: true,
                    },
                    {
                        association: 'detectors',
                        where: { name: dplDetector.name },
                        through: { attributes: [] },
                        attributes: [],
                        required: true,
                    },
                ],
            });
            if (!targetRun) {
            // eslint-disable-next-line max-len
                throw new BadParameterError(`There is not association between simulation pass with this id (${simulationPassId}), run with this number (${runNumber}) and detector with this name (${dplDetector.name})`);
            }

            const { fromTime, toTime } = this._prepareQcFlagPeriod({ from, to }, targetRun);

            // Insert
            const newInstance = await QcFlagRepository.insert({
                from: fromTime,
                to: toTime,
                comment,
                createdById: user.id,
                flagTypeId,
                runNumber,
                dplDetectorId,
            });

            const createdFlag = await QcFlagRepository.findOne(this.prepareQueryBuilder().where('id').is(newInstance.id));

            await createdFlag.addSimulationPasses(targetRun.simulationPasses);

            return qcFlagAdapter.toEntity(createdFlag);
        });
    }

    /**
     * Delete single instance of QC flag
     * @param {number} id QC flag id
     * @param {object} relations QC Flag entity relations
     * @param {UserWithRoles} relations.userWithRoles user with roles
     * @return {Promise<QcFlag>} promise
     */
    async delete(id, relations) {
        return dataSource.transaction(async () => {
            const qcFlag = await QcFlagRepository.findOne({
                where: { id },
                include: [{ association: 'dataPasses' }, { association: 'simulationPasses' }],
            });
            if (!qcFlag) {
                throw new NotFoundError(`Quality Control Flag with this id (${id}) could not be found`);
            }

            const { userWithRoles: { userId, externalUserId, roles = [] } } = relations;
            const user = await getUserOrFail({ userId, externalUserId });

            if (qcFlag.createdById !== user.id && !roles.includes(BkpRoles.ADMIN)) {
                throw new AccessDeniedError('You are not allowed to remove this QC flag');
            }

            await qcFlag.removeDataPasses(qcFlag.dataPasses);
            await qcFlag.removeSimulationPasses(qcFlag.simulationPasses);
            return QcFlagRepository.removeOne({ where: { id } });
        });
    }

    /**
     * Get all quality control flags instances
     * @param {object} [options.filter] filtering defintion
     * @param {number[]} [options.filter.ids] quality control flag ids to filter with
     * @param {number[]} [options.filter.dataPassIds] data pass ids to filter with
     * @param {number[]} [options.filter.simulationPassIds] simulation pass ids to filter with
     * @param {number[]} [options.filter.runNumbers] run numbers to filter with
     * @param {number[]} [options.filter.dplDetectorIds] dpl detector ids to filter with
     * @param {string[]} [options.filter.createdBy] user names to filter with
     * @param {number} [options.offset] paramter related to pagination - offset
     * @param {number} [options.limit] paramter related to pagination - limit
     * @param {Object<string, 'ASC'|'DESC'>[]} [options.sort] definition of sorting
     * @return {Promise<CountedItems<QcFlag>>} promise
     */
    async getAll({ filter, sort, limit, offset } = {}) {
        const queryBuilder = this.prepareQueryBuilder();

        if (sort) {
            const { createdBy: createdByOrder, flagType: flagTypeOrder, ...otherSortProperties } = sort;
            if (createdByOrder) {
                queryBuilder.orderBy((sequelize) => sequelize.literal('`createdBy`.name'), createdByOrder);
            }
            if (flagTypeOrder) {
                queryBuilder.orderBy((sequelize) => sequelize.literal('`flagType`.name'), flagTypeOrder);
            }
            for (const property in otherSortProperties) {
                queryBuilder.orderBy(property, sort[property]);
            }
        }

        if (limit) {
            queryBuilder.limit(limit);
        }
        if (offset) {
            queryBuilder.offset(offset);
        }

        if (filter) {
            const { ids, dataPassIds, runNumbers, dplDetectorIds, createdBy, simulationPassIds } = filter;
            if (ids) {
                queryBuilder.where('id').oneOf(...ids);
            }
            if (dataPassIds) {
                queryBuilder.whereAssociation('dataPasses', 'id').oneOf(...dataPassIds);
            }
            if (simulationPassIds) {
                queryBuilder.whereAssociation('simulationPasses', 'id').oneOf(...simulationPassIds);
            }
            if (runNumbers) {
                queryBuilder.whereAssociation('run', 'runNumber').oneOf(...runNumbers);
            }
            if (dplDetectorIds) {
                queryBuilder.whereAssociation('dplDetector', 'id').oneOf(...dplDetectorIds);
            }
            if (createdBy) {
                queryBuilder.whereAssociation('createdBy', 'name').oneOf(...createdBy);
            }
        }

        const { count, rows } = await QcFlagRepository.findAndCountAll(queryBuilder);

        return {
            count: count.length,
            rows: rows.map(qcFlagAdapter.toEntity),
        };
    }

    /**
     * Prepare query builder with common includes for fetching data
     * @return {QueryBuilder} common fetch-data query builder
     */
    prepareQueryBuilder() {
        return dataSource.createQueryBuilder()
            .include({ association: 'flagType' })
            .include({ association: 'createdBy' })
            .groupBy('id');
    }
}

module.exports.QcFlagService = QcFlagService;

module.exports.qcFlagService = new QcFlagService();
