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
const { appendPath } = require('../utilities');
const { deepmerge, isPromise } = require('../../utilities');

const attachmentRoute = require('./attachments.router');
const { configurationRouter } = require('./configuration.router.js');
const detectorsRoute = require('./detectors.router');
const { dplProcessRouter } = require('./dplProcess.router.js');
const environmentRoute = require('./environments.router');
const { eosReportRouter } = require('./eosReport.router.js');
const flpsRoute = require('./flps.router');
const lhcFillRoute = require('./lhcFills.router');
const logRoute = require('./logs.router');
const runTypesRoute = require('./runTypes.router');
const runsRoute = require('./runs.router');
const { shiftRouter } = require('./shift.router.js');
const { statisticsRouter } = require('./statistics.router.js');
const statusRoute = require('./status.router');
const subsystemsRoute = require('./subsystems.router');
const tagsRoute = require('./tags.router');
const { lhcPeriodsRouter } = require('./lhcPeriodsStatistics.router.js');
const { isInTestMode, isInDevMode } = require('../../utilities/env-utils');

const routes = [
    attachmentRoute,
    configurationRouter,
    detectorsRoute,
    dplProcessRouter,
    environmentRoute,
    eosReportRouter,
    flpsRoute,
    lhcFillRoute,
    lhcFillRoute,
    logRoute,
    runTypesRoute,
    runsRoute,
    shiftRouter,
    statisticsRouter,
    statusRoute,
    subsystemsRoute,
    tagsRoute,
    lhcPeriodsRouter,
];

/**
 * Makes the child object inherit the args of the parent object, but keeps the overwrites.
 *
 * @param {Object} parent parent who's args will be inherited
 * @param {Object} child child who will inherit the args
 * @returns {undefined}
 */
const inheritArgs = (parent, child) => {
    child.args = deepmerge(parent.args || {}, child.args || {});
};

/**
 * Route binder, used to bind routes to the httpServer.
 *
 * @param {Object} http httpServer that the routes should be bound on
 * @param {Object} route the route that should be bound
 * @param {string} [parentPath=''] the base path of the route
 * @returns {undefined}
 */
const bindRoute = (http, route, parentPath = '') => {
    const localPath = appendPath(parentPath, route.path, route.pathOption);
    if (route.method && route.controller) {
        if (isInTestMode() || isInDevMode()) { // TODO remove
            route.args.public = true;
        }

        http[route.method](localPath, ...(Array.isArray(route.controller) ? route.controller : [route.controller])
            .map((controller) => async (...args) => {
                const callable = controller;
                if (isPromise(callable)) {
                    await callable(...args).catch(args[args.length - 1]);
                    return;
                }

                try {
                    callable(...args);
                } catch (error) {
                    args[args.length - 1](error);
                }
            }), route.args);
    }

    if (route.children) {
        route.children.forEach((child) => {
            inheritArgs(route, child);
            bindRoute(http, child, localPath);
        });
    }
};

module.exports = (http) => {
    routes.forEach((route) => {
        bindRoute(http, route);
    });
};
