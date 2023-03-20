/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

const { sequelize } = require('../../../database');
const { Op } = require('sequelize');
const { EnvironmentRepository } = require('../../../database/repositories/index.js');
const { environmentIncludeClauseFromRelations } = require('./environmentIncludeClauseFromRelations.js');

const ENVIRONMENT_CONSIDERED_LOST_AFTER = 48 * 3600 * 1000;

/**
 * Time after which one an environment without status change is considered to be lost
 * @type {number}
 */
exports.ENVIRONMENT_CONSIDERED_LOST_AFTER = ENVIRONMENT_CONSIDERED_LOST_AFTER;

/**
 * Returns the list of environments considered to be en the given period
 *
 * @param {object} period the period with which the environment must overlap
 * @param {number} period.from the start of the period (UNIX timestamp in milliseconds)
 * @param {number} period.to the end of the period (UNIX timestamp in milliseconds)
 * @param {EnvironmentRelationsToInclude} [relations] optionally the list of relations to include alongside the environment
 * @return {Promise<SequelizeEnvironment[]>} the list of environments in the period
 */
exports.getEnvironmentsInPeriod = async ({ from, to }, relations) => {
    // eslint-disable-next-line require-jsdoc
    const timestampToMysql = (timestamp) => new Date(timestamp).toISOString().slice(0, 19).replace('T', ' ');

    // Environments are considered lost if we have no news a long time before start
    const lostIfNoNewsSince = from - ENVIRONMENT_CONSIDERED_LOST_AFTER;

    // Fetch the ids of the environments with a raw query because the needs are complex
    const [rows] = await sequelize.query(`
        SELECT e.id
        FROM environments_history_items ehi
                 INNER JOIN environments e on ehi.environment_id = e.id
        WHERE e.created_at < '${timestampToMysql(to)}'
        GROUP BY e.id, e.created_at, e.updated_at
        HAVING (GROUP_CONCAT(ehi.status) NOT LIKE '%DESTROYED%'
            AND GROUP_CONCAT(ehi.status) NOT LIKE '%ERROR%'
            AND e.updated_at > '${timestampToMysql(lostIfNoNewsSince)}')
            OR e.updated_at >= '${timestampToMysql(from)}'
    `);
    const ids = rows.map(({ id }) => id);

    return EnvironmentRepository.findAll({ where: { id: { [Op.in]: ids } }, include: environmentIncludeClauseFromRelations(relations) });
};
