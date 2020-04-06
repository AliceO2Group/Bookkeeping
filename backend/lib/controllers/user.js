/**
 * Get all users
 * @param {Object} _request response object
 * @param {Object} response response object
 * @returns {undefined}
 */
const index = (_request, response) => {
    response.send('USER INDEX not defined');
};

/**
 * Get all logs of User
 * @param {Object} _request response object
 * @param {Object} response response object
 * @returns {undefined}
 */
const getLogs = (_request, response) => {
    response.send('USER GET_LOGS not defined');
};

/**
 * Get Tokens of user
 * @param {Object} _request response object
 * @param {Object} response response object
 * @returns {undefined}
 */
const getTokens = (_request, response) => {
    response.send('USER GET_TOKENS not defined');
};

/**
 * Get user
 * @param {Object} _request response object
 * @param {Object} response response object
 * @returns {undefined}
 */
const read = (_request, response) => {
    response.send('USER READ not defined');
};

/**
 * Post token for user
 * @param {Object} _request response object
 * @param {Object} response response object
 * @returns {undefined}
 */
const postTokens = (_request, response) => {
    response.send('USER POST_TOKENS not defined');
};

module.exports = {
    index,
    read,
    getLogs,
    getTokens,
    postTokens,
};
