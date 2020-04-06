const User = require('./user');
const Tag = require('./tag');

/**
 * Basic api information controller
 * @param {Object} _request response object
 * @param {Object} response response object
 * @returns {undefined}
 */
const Api = (_request, response) => {
    response.status(200).json({
        name: 'Jiskefet Backend',
        version: '0.0.0',
    });
};

module.exports = {
    Api,
    Tag,
    User,
};
