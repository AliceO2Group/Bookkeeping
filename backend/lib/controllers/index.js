const User = require('./user');
const Tag = require('./tag');

/**
 *
 * @param {Object} req
 * @param {Object} res
 */
const Api = (req, res) => {
    res.status(200).json({
        name: 'Jiskefet Backend',
        version: '0.0.0',
    });
};

module.exports = {
    Api,
    Tag,
    User,
};
