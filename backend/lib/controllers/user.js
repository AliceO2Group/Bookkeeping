/**
 *
 * @param {Object} req
 * @param {Object} res
 */
const index = (req, res) => {
  res.send('USER INDEX not defined');
};

/**
 *
 * @param {Object} req
 * @param {Object} res
 */
const getLogs = (req, res) => {
  res.send('USER GETLOGS not defined');
};

/**
 *
 * @param {Object} req
 * @param {Object} res
 */
const getTokens = (req, res) => {
  res.send('USER TOKENS not defined');
};

/**
 *
 * @param {Object} req
 * @param {Object} res
 */
const read = (req, res) => {
  res.send('USER GET not defined');
};

/**
 *
 * @param {Object} req
 * @param {Object} res
 */
const postTokens = (req, res) => {
  res.send('USER POSTTOKENS not defined');
};

module.exports = {
  index,
  read,
  getLogs,
  getTokens,
  postTokens,
};