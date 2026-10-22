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

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    // `updated_at` is explicitly kept as is because the column has ON UPDATE CURRENT_TIMESTAMP, and the status history is ordered by it
    up: async (queryInterface) => queryInterface.sequelize.query(`
        UPDATE environments_history_items
        SET status = 'DONE', updated_at = updated_at
        WHERE status = 'DESTROYED'
    `),

    // The DESTROYED status is deprecated: the rows converted by `up` cannot be told apart from the ones that were already DONE
    down: async () => {},
};
