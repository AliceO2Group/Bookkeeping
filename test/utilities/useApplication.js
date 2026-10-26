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

const application = require('../../lib/application.js');

/**
 * Register the hooks starting the application (migrations are applied before anything else is started) before the tests of the current
 * suite, and stopping it afterwards
 *
 * @return {void}
 */
exports.useApplication = () => {
    before(async () => {
        if (!await application.start()) {
            throw new Error('Application could not be started');
        }
    });

    after(async () => {
        await application.stop(true);
    });
};
