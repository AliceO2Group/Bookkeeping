const UserController = require('./user');
const TagController = require('./tag');

/**
 * Basic api information controller
 * @param {Object} _request response object
 * @param {Object} response response object
 * @param {CallableFunction} _next next callback
 * @returns {undefined}
 */
const ApiController = (_request, response, _next) => {
    response.status(200).json({
        name: 'Jiskefet Backend',
        version: '0.0.0',
    });
};

module.exports = {
    ApiController,
    TagController,
    UserController,
};
