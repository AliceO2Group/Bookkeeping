const User = require('./user');

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
  User,
};