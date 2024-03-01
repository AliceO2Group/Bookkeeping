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

const { repositories: { QualityControlFlagRepository, RunRepository, DplDetectorRepository } } = require('../../../database');
const { dataSource } = require('../../../database/DataSource.js');
const { qualityControlFlagAdapter } = require('../../../database/adapters');
const { BadParameterError } = require('../../errors/BadParameterError');
const { getUserOrFail } = require('../user/getUserOrFail');

/**
 * Quality control flags service
 */
class QualityControlFlagService {
    /**
     * Create new instance of quality control flags
     * @param {QualityControlFlag+UserIdentifier} parameters flag instance parameters
     * @return {Promise<QualityControlFlag>} promise
     * @throws {BadParameterError, NotFoundError}
     */
    async createForDataPass(parameters) {
        const {
            fromTime,
            toTime,
            comment,
            userId,
            externalUserId,
            flagTypeId,
            runNumber,
            dataPassId,
            dplDetectorId,
        } = parameters;

        if (!(fromTime < toTime)) {
            throw new BadParameterError('Parameter `timeEnd` must be greater than `timeStart`');
        }
        return dataSource.transaction(async () => {
            // Check user
            const user = await getUserOrFail({ userId, externalUserId });

            // Check associations
            const detector = await DplDetectorRepository.findOne({ where: { id: dplDetectorId } });
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
                        where: { name: detector.name },
                        through: { attributes: [] },
                        attributes: [],
                        required: true,
                    },
                ],
            });
            if (!result) {
                // eslint-disable-next-line max-len
                throw new BadParameterError(`You cannot insert flag for data pass (id:${dataPassId}), run (runNumber:${runNumber}), detector (id:${dplDetectorId}) as there is no association between them`);
            }

            if (fromTime < result.timeTrgStart.getTime() || result.timeTrgEnd.getTime() < toTime) {
                // eslint-disable-next-line max-len
                throw new BadParameterError(`Given QC flag period (${fromTime} ${toTime}) is beyond run trigger period (${result.timeTrgStart.getTime()}, ${result.timeTrgEnd.getTime()})`);
            }

            // Insert
            const newInstance = await QualityControlFlagRepository.insert({
                from: fromTime,
                to: toTime,
                comment,
                userId: user.id,
                flagTypeId,
                runNumber,
                dplDetectorId,
            });

            const { rows: [createdFlag] } = await this.getAll({ filter: { ids: [newInstance.id] } });

            createdFlag.addDataPass(result.dataPass);

            return createdFlag;
        });
    }

    /**
     * Get all quality control flags instances
     * @param {object} [options.filter] filtering defintion
     * @param {number[]} [options.filter.ids] quality control flag ids to filter with
     * @param {number[]} [options.filter.dataPassIds] data pass ids to filter with
     * @param {number[]} [options.filter.simulationPassIds] simulation pass ids to filter with
     * @param {number[]} [options.filter.runNumbers] run numbers to filter with
     * @param {number[]} [options.filter.detectorIds] dpl detector ids to filter with
     * @param {string[]} [options.filter.userNames] user names to filter with
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
            const { ids, dataPassIds, runNumbers, detectorIds, userNames, simulationPassIds } = filter;
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
            if (detectorIds) {
                queryBuilder.whereAssociation('dplDetector', 'id').oneOf(...detectorIds);
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
            .include({ association: 'flagType' })
            .include({ association: 'user' })
            .groupBy('id');
    }
}

module.exports.QualityControlFlagService = QualityControlFlagService;

module.exports.qualityControlFlagService = new QualityControlFlagService();
