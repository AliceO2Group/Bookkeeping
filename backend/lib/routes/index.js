const { Api } = require('../controllers');
const userRoute = require('./users');
const tagsRoute = require('./tags');
const deepmerge = require('../utils/deepmerge');

const routes = [
    {
        method: 'get',
        path: '/',
        controller: Api,
        args: { public: true },
    },
    userRoute,
    tagsRoute,
];

/**
 *
 * @param {Object} parent
 * @param {Object} child
 */
const inheritArgs = (parent, child) => {
    child.args = deepmerge(parent.args||{}, child.args||{});
}

/**
 * Route binder, used to bind routes to the httpServer
 * @param {Object} http httpServer that the routes should be bound on
 * @param {Object} route the route that should be bound
 * @param {String} [path=''] the base path of the route
 */
const bindRoute = (http, route, parentPath = '') => {
    const localPath = parentPath.concat(route.path);

    if (route.method && route.controller) {
        http[route.method](localPath, route.controller, route.args);
    }

    if (route.children) {
        route.children.forEach(child => {
            inheritArgs(route, child);
            bindRoute(http, child, localPath);
        });
    }
}

module.exports = (http) => {
    routes.forEach(route => {
        bindRoute(http, route);
    });
}
