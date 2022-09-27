/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { fetchClient } from '/js/src/index.js';

/**
 * Send a request to a remote endpoint, and extract the response. If errors occurred, an array of errors containing title and detail is thrown
 *
 * The endpoint is expected to follow some conventions:
 *   - If request is valid but no data must be sent, it must return a 204
 *   - If data must be returned, the json response must contain a top level "data" key
 *   - If an error occurred, NO "data" key must be present, and there can be one of the following keys:
 *     - errors: a list of errors containing title and detail
 *     - error and message describing the error that occurred
 *
 * @param {string} endpoint the remote endpoint to send request to
 * @return {Promise<*>} resolve with the result of the request or reject with the list of errors if any error occurred
 */
export const fetchJson = async (endpoint) => {
    let result;
    try {
        const response = await fetchClient(endpoint, { method: 'GET' });

        // 204 means no data and the response do not have a body
        if (response.status === 204) {
            result = null;
        } else {
            result = await response.json();
        }
    } catch (e) {
        result = {
            detail: e.message,
        };
    }

    if (result === null || result.data) {
        return result;
    }

    return Promise.reject(result.errors || [
        {
            title: result.error || 'Request failure',
            detail: result.message || 'An error occurred while fetching data',
        },
    ]);
};
