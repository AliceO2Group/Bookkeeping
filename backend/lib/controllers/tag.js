/**
 *
 * @param {Object} req
 * @param {Object} res
 */
const create = (req, res) => {
    res.send('TAG CREATE not defined');
}

/**
 *
 * @param {Object} req
 * @param {Object} res
 */
const deleteTag = (req, res) => {
    res.send('TAG DELETE not defined');
}

/**
 *
 * @param {Object} req
 * @param {Object} res
 */
const getLogs = (req, res) => {
    res.send('TAG GET_LOGS not defined');
};

/**
 *
 * @param {Object} req
 * @param {Object} res
 */
const getRuns = (req, res) => {
    res.send('TAG GET_RUNS not defined');
}

/**
 *
 * @param {Object} req
 * @param {Object} res
 */
const index = (req, res) => {
    res.send('TAG INDEX not defined');
};

/**
 *
 * @param {Object} req
 * @param {Object} res
 */
const patchLog = (req, res) => {
    res.send('TAG PATCH_LOG not defined');
};

/**
 *
 * @param {Object} req
 * @param {Object} res
 */
const patchRun = (req, res) => {
    res.send('TAG PATCH_RUN not defined');
};

/**
 *
 * @param {Object} req
 * @param {Object} res
 */
const read = (req, res) => {
    res.send('TAG READ not defined');
}

module.exports = {
    create,
    deleteTag,
    getLogs,
    getRuns,
    index,
    patchLog,
    patchRun,
    read,
}
