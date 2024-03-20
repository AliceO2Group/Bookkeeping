/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

import { jsonFetch } from './jsonFetch.js';

/**
 * Send the given body as JSON post request to the server and return the result parsed from JSON
 *
 * @param {string} endpoint the remote endpoint to send request to
 * @param {string|object} body the body of the request to send
 * @return {Promise<*>} resolves with the result parsed from JSON
 */
export const jsonPost = (endpoint, body) => {
    if (typeof body !== 'string') {
        body = JSON.stringify(body);
    }

    return jsonFetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: body,
    });
};
