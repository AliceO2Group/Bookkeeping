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
    /*
     * Pause GAQ worker and await any in-flight call before dropping tables, otherwise a tick
     * already past the guard would hit dropped tables and log a spurious ERROR. Restore the
     * prior paused state on the way out so callers that paused first stay paused.
     */
    const wasPaused = gaqWorker.isPaused;
    await gaqWorker.pause();
    await database.dropAllTables();
    await database.migrate();
    await database.seed();
    if (!wasPaused) {
        gaqWorker.resume();
    }
};
