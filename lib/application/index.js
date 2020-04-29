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

const { Application } = require('./interfaces');
const { Logger } = require('../utilities');
const database = require('../database');
const server = require('../server');

const _1_S_IN_MS = 1000;
const SHUTDOWN_DELAY_MS = 5 * _1_S_IN_MS;

/**
 * Bookkeeping Application
 */
class BookkeepingApplication extends Application {
    /**
     * Creates a new `Bookkeeping Application` instance.
     */
    constructor() {
        super();

        this.logger = Logger('application');
        this.server = server;
        this.database = database;
    }

    /**
     * Causes the application to be scheduled for execution.
     *
     * @returns {Promise} Promise object represents the outcome.
     */
    async run() {
        try {
            await this.database.connect();
            await this.database.migrate();

            if (process.env.NODE_ENV === 'test') {
                await this.database.seed();
            }

            await this.server.listen();
        } catch (error) {
            this.logger.error(error);
            return this.stop();
        }
    }

    /**
     * Begins the process of terminating the application. Calling this method terminates the process.
     *
     * @param {Boolean} [immediate=false] Indicates if the underlying services should be closed immediately; if *false*
     *                                    it will close the underlying services gracefully.
     * @returns {Promise} Promise object represents the outcome.
     */
    async stop(immediate) {
        this.server.acceptIncomingConnections(false);

        if (immediate) {
            await this.database.disconnect();
            return this.server.close();
        }

        setTimeout(async () => {
            await this.database.disconnect();
            this.server.close()
                .then(() => process.exit(0))
                .catch(() => process.exit(1));
        }, SHUTDOWN_DELAY_MS);
    }
}

module.exports = new BookkeepingApplication();
