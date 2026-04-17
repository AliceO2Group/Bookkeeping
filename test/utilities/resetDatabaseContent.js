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

const { database } = require('../../lib/application.js');
const { gaqWorker } = require('../../lib/server/services/gaq/GaqWorker.js');

exports.resetDatabaseContent = async () => {
    // Pause GAQ worker when resetDatabaseContent() runs in between tests in the different test suites
    // Otherwise, worker fails as the invalidation table is DROPPED. This avoids an ERROR message appearing in test logs even if the suite passed
    gaqWorker.pause();
    await database.dropAllTables();
    await database.migrate();
    await database.seed();
    gaqWorker.resume();
};
