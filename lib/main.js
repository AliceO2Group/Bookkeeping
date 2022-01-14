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

const application = require('./application');

application.run();

const dbInterval = setInterval(async () => {
    if (await  application.connectDatabase()) {
        clearInterval(dbInterval);
    }
}, 5000);



/*
 * 'SIGTERM' and 'SIGINT' have default handlers on non-Windows platforms that reset the terminal mode before exiting
 * with code 128 + signal number. If one of these signals has a listener installed, its default behavior will be removed
 * (Node.js will no longer exit).
 */
['SIGTERM', 'SIGINT', 'SIGHUP'].forEach((event) => process.on(event, application.stop.bind(application)));
