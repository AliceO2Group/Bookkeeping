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

const { repositories: { QualityControlFlagRepository, RunRepository, QualityControlFlagVerificationRepository } } = require('../../../database');
const { dataSource } = require('../../../database/DataSource.js');
const { qualityControlFlagAdapter, qualityControlFlagReasonAdapter } = require('../../../database/adapters');
const { BadParameterError } = require('../../errors/BadParameterError');
const { getUserOrFail } = require('../user/getUserOrFail');

/**
 * Quality control flags service
 */
class QualityControlFlagService {
    /**
     * Create verification of quality control flag
     * @param {object} parameters flag verification instance parameters
     * @param {object} [parameters.qualityControlFlagId] id of ac flag wich is verified
     * @param {object} [parameters.comment] comment of the user
     * @param {object} [parameters.externalUserId] external id of user who verifies
     * @return {Promise<QualityControlFlagVerification>} promise
     * @throws {NotFoundError}
     */
    async createVerification({ qualityControlFlagId, comment, externalUserId }) {
        // Check user
        const user = await getUserOrFail({ externalUserId });

        const qcFlag = await QualityControlFlagRepository.findOne({
            where: { id: qualityControlFlagId },
            include: { association: 'user' },
        });

        if (!qcFlag) {
            throw new BadParameterError(`Cannot find qc flag with id ${qualityControlFlagId}`);
        }

        if (qcFlag.user.externalId === externalUserId) {
            throw new Error(`It is not possibly not verify one's own QC Flag (id:${qcFlag.id})`);
        }

        // Insert
        const newInstance = await QualityControlFlagVerificationRepository.insert({
            qualityControlFlagId,
            comment,
            userId: user.id,
        });

        return qualityControlFlagReasonAdapter.toEntity(newInstance);
    }

    /**
     * Create new instance of quality control flags
     * @param {QualityControlFlag+UserIdentifier} parameters flag instance parameters
     * @return {Promise<QualityControlFlag>} promise
     * @throws {BadParameterError, NotFoundError}
     */
    async create(parameters) {
        const {
            timeStart,
            timeEnd,
            comment,
            provenance,
            userId,
            externalUserId,
            flagReasonId,
            runNumber,
            dataPassId,
            detectorId,
        } = parameters;

        if (!(timeStart < timeEnd)) {
            throw new BadParameterError('Parameter `timeEnd` must be greater than `timeStart`');
        }

        // Check user
        const user = await getUserOrFail({ userId, externalUserId });

        // Check associations
        const result = await RunRepository.findOne({
            subQuery: false,
            attributes: ['timeTrgStart', 'timeTrgEnd'],
            where: { runNumber },
            include: [
                {
                    association: 'dataPass',
                    where: { id: dataPassId },
                    through: { attributes: [] },
                    attributes: [],
                    required: true,
                },
                {
                    association: 'detectors',
                    where: { id: detectorId },
                    through: { attributes: [] },
                    attributes: [],
                    required: true,
                },
            ],
        });
        if (!result) {
            throw new BadParameterError(`
                You cannot insert flag for data pass (id:${dataPassId}), run (runNumber:${runNumber}), detector (id:${detectorId})
                as there is no association between them
            `);
        }

        if (timeStart < result.timeTrgStart.getTime() || result.timeTrgEnd.getTime() < timeEnd) {
            throw new BadParameterError(`
                Given QC flag period (${timeStart} ${timeEnd}) is beyond
                run trigger period (${result.timeTrgStart.getTime()}, ${result.timeTrgEnd.getTime()})`);
        }

        // Insert
        const newInstance = await QualityControlFlagRepository.insert({
            timeStart,
            timeEnd,
            comment,
            provenance,
            userId: user.id,
            flagReasonId,
            runNumber,
            dataPassId,
            detectorId,
        });

        const { rows: [createdFlag] } = await this.getAll({ filter: { ids: [newInstance.id] } });

        return createdFlag;
    }

    /**
     * Get all quality control flags instances
     * @param {object} [options.filter] filtering defintion
     * @param {number[]} [options.filter.ids] filtering defintion
     * @param {number[]} [options.filter.dataPassIds] filtering defintion
     * @param {number[]} [options.filter.runNumbers] filtering defintion
     * @param {number[]} [options.filter.detectorIds] filtering defintion
     * @param {number[]} [options.filter.externalUserIds] filtering defintion
     * @param {string[]} [options.filter.userNames] filtering defintion
     * @param {number} [options.offset] paramter related to pagination - offset
     * @param {number} [options.limit] paramter related to pagination - limit
     * @param {Object<string, 'ASC'|'DESC'>[]} [options.sort] definition of sorting
     * @return {Promise<CountedItems<QualityControlFlag>>} promise
     */
    async getAll({ filter, sort, limit, offset } = {}) {
        const queryBuilder = this.prepareQueryBuilder();

        if (sort) {
            for (const property in sort) {
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
            const { ids, dataPassIds, runNumbers, detectorIds, externalUserIds, userNames } = filter;
            if (ids) {
                queryBuilder.where('id').oneOf(...ids);
            }
            if (dataPassIds) {
                queryBuilder.whereAssociation('dataPass', 'id').oneOf(...dataPassIds);
            }
            if (runNumbers) {
                queryBuilder.whereAssociation('run', 'runNumber').oneOf(...runNumbers);
            }
            if (detectorIds) {
                queryBuilder.whereAssociation('detector', 'id').oneOf(...detectorIds);
            }
            if (externalUserIds) {
                queryBuilder.whereAssociation('user', 'externalId').oneOf(...externalUserIds);
            }
            if (userNames) {
                queryBuilder.whereAssociation('user', 'name').oneOf(...userNames);
            }
        }

        const { count, rows } = await QualityControlFlagRepository.findAndCountAll(queryBuilder);

        return {
            count: count.length,
            rows: rows.map(qualityControlFlagAdapter.toEntity),
        };
    }

    /**
     * Prepare query builder with common includes for fetching data
     * @return {QueryBuilder} common fetch-data query builder
     */
    prepareQueryBuilder() {
        return dataSource.createQueryBuilder()
            .include({ association: 'verifications', include: [{ association: 'user' }] })
            .include({ association: 'flagReason' })
            .include({ association: 'user' })
            .groupBy('id');
    }
}

module.exports.QualityControlFlagService = QualityControlFlagService;

module.exports.qualityControlFlagService = new QualityControlFlagService();
