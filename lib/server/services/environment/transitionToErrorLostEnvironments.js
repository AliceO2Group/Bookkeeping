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

const { sequelize } = require('../../../database/index.js');
const { utilities: { TransactionHelper } } = require('../../../database');
const { EnvironmentHistoryItemRepository } = require('../../../database/repositories/index.js');
const { timestampToMysql } = require('../../utilities/timestampToMysql.js');

/**
 * Consider all the environments that are currently active but not in the given list of ids to be lost, and transition them to error
 *
 * @param {string[]} activeEnvironmentIds the ids of active environments (those environments will not be transitioned to error)
 * @param {Period} modificationTimePeriod environments created outside this time period will not be updated
 * @return {Promise<number[]>} resolve once all inactive environments has been transitioned to error with their ids
 * @deprecated
 */
exports.transitionToErrorLostEnvironments = async (activeEnvironmentIds, modificationTimePeriod) => {
    // The select query is adapted for the insert
    let selectQuery = `
        SELECT e.id
        FROM environments_history_items ehi
                 INNER JOIN environments e ON ehi.environment_id = e.id
        GROUP BY e.id, e.updated_at, e.created_at
        HAVING e.updated_at >= '${timestampToMysql(modificationTimePeriod.from)}'
           AND e.created_at < '${timestampToMysql(modificationTimePeriod.to)}'
           AND group_concat(ehi.status) NOT LIKE '%ERROR%'
           AND group_concat(ehi.status) NOT LIKE '%DESTROYED%'
    `;
    if (activeEnvironmentIds.length > 0) {
        selectQuery += ` AND e.id NOT IN (${activeEnvironmentIds.map((id) => `'${id}'`).join(',')})`;
    }

    return TransactionHelper.provide(async () => {
        const [rows] = await sequelize.query(selectQuery, { raw: true });
        const ret = [];

        /**
         * @type {SequelizeEnvironmentHistoryItem[]}
         */
        const historyItemsToCreate = [];
        for (const { id } of rows) {
            ret.push(id);
            historyItemsToCreate.push({
                environmentId: id,
                status: 'ERROR',
                statusMessage: 'Shutdown not received but environment does not exist anymore',
            });
        }

        await EnvironmentHistoryItemRepository.bulkInsert(historyItemsToCreate);
        return ret;
    });
};
