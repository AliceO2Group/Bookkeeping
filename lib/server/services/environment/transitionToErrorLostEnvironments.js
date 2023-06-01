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

/**
 * Consider all the environments that are currently active but not in the given list of ids to be lost, and transition them to error
 *
 * @param {string[]} activeEnvironmentIds the ids of active environments (those environments will not be transitioned to error)
 * @param {number} modificationTimeWindow the time we have (in MINUTES), after the creation of an environment, to purge them. If an environment
 *     has been created more than this amount of minutes before NOW, it is NOT purged
 * @return {Promise<void>} resolve once all inactive environments has been transitioned to error
 * @deprecated
 */
exports.transitionToErrorLostEnvironments = async (activeEnvironmentIds, modificationTimeWindow) => sequelize.query(`
    INSERT INTO environments_history_items (environment_id, status, status_message)
    SELECT e.id, 'ERROR', 'Shutdown not received, environment not existing anymore'
    FROM environments_history_items ehi
             INNER JOIN environments e ON ehi.environment_id = e.id
    GROUP BY e.id, e.updated_at
    HAVING e.updated_at > date_sub(now(), INTERVAL ${modificationTimeWindow} MINUTE)
       AND group_concat(ehi.status) NOT LIKE '%ERROR%'
       AND group_concat(ehi.status) NOT LIKE '%DESTROYED%'
       AND e.id NOT IN (${activeEnvironmentIds.map((id) => `'${id}'`).join(',')})
`);
