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
