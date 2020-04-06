/**
 * Create tag
 * @param {Object} _request response object
 * @param {Object} response response object
 * @returns {undefined}
 */
const create = (_request, response) => {
    response.send('TAG CREATE not defined');
};

/**
 * Delete tag
 * @param {Object} _request response object
 * @param {Object} response response object
 * @returns {undefined}
 */
const deleteTag = (_request, response) => {
    response.send('TAG DELETE not defined');
};

/**
 * Get all logs with tag
 * @param {Object} _request response object
 * @param {Object} response response object
 * @returns {undefined}
 */
const getLogs = (_request, response) => {
    response.send('TAG GET_LOGS not defined');
};

/**
 * Get all Runs with tag
 * @param {Object} _request response object
 * @param {Object} response response object
 * @returns {undefined}
 */
const getRuns = (_request, response) => {
    response.send('TAG GET_RUNS not defined');
};

/**
 * Get all tags
 * @param {Object} _request response object
 * @param {Object} response response object
 * @returns {undefined}
 */
const index = (_request, response) => {
    response.send('TAG INDEX not defined');
};

/**
 * Patch tag on log
 * @param {Object} _request response object
 * @param {Object} response response object
 * @returns {undefined}
 */
const patchLog = (_request, response) => {
    response.send('TAG PATCH_LOG not defined');
};

/**
 * Patch tag on run
 * @param {Object} _request response object
 * @param {Object} response response object
 * @returns {undefined}
 */
const patchRun = (_request, response) => {
    response.send('TAG PATCH_RUN not defined');
};

/**
 * Get tag
 * @param {Object} _request response object
 * @param {Object} response response object
 * @returns {undefined}
 */
const read = (_request, response) => {
    response.send('TAG READ not defined');
};

module.exports = {
    create,
    deleteTag,
    getLogs,
    getRuns,
    index,
    patchLog,
    patchRun,
    read,
};
