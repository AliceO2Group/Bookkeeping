/**
 * This file is part of the ALICE Electronic Logbook v2, also known as Jiskefet.
 * Copyright (C) 2020  Stichting Hogeschool van Amsterdam
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
const attachmentRoute = require('./attachments.router');
const authRoute = require('./auth.router');
const createpdfRoute = require('./createpdf.router');
const flpRoute = require('./flp.router');
const homeRoute = require('./home.router');
const logRoute = require('./logs.router');
const overviewRoute = require('./overviews.router');
const runsRoute = require('./runs.router');
const settingsRoute = require('./settings.router');
const subsystemsRoute = require('./subsystems.router');
const tagsRoute = require('./tags.router');
const usersRoute = require('./users.router');
const { appendPath, deepmerge } = require('../utils');

const routes = [
    attachmentRoute,
    authRoute,
    createpdfRoute,
    flpRoute,
    homeRoute,
    logRoute,
    overviewRoute,
    runsRoute,
    settingsRoute,
    subsystemsRoute,
    tagsRoute,
    usersRoute,
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
 * @param {String} [parentPath=''] the base path of the route
 * @returns {undefined}
 */
const bindRoute = (http, route, parentPath = '') => {
    const localPath = appendPath(parentPath, route.path, route.pathOption);
    if (route.method && route.controller) {
        http[route.method](localPath, route.controller, route.args);
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

module.exports.getRoutesAsList = () => {
    const resolvedRoutes = [];

    /* eslint-disable */
    function resolve(route, parentPath = '') {
        const localPath = appendPath(parentPath, route.path, route.pathOption);

        if (route.method && route.controller) {
            resolvedRoutes.push({
                method: route.method,
                path: localPath,
            });
        }

        if (route.children) {
            route.children.forEach((child) => {
                inheritArgs(route, child);
                resolve(child, localPath);
            });
        }
    }
    /* eslint-enable */

    routes.forEach((route) => resolve(route));

    return resolvedRoutes;
};
