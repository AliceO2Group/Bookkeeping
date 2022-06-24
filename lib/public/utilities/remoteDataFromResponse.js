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

import { RemoteData } from '/js/src/index.js';

/**
 * Parse a fetch {@see Response} into a {@see RemoteData}
 *
 * @param {Response} response the response to parse for remote data
 *
 * @return {Promise<{remoteData: RemoteData}>} the parsed remote data
 */
export const remoteDataFromResponse = async (response) => {
    let jsonResponse = {};

    if (response.ok) {
        // 204 means no tags but the response do not have a body
        if (response.status === 204) {
            jsonResponse = { data: [] };
        } else {
            jsonResponse = await response.json();
        }
    }

    let remoteData;
    if (Array.isArray(jsonResponse.data)) {
        remoteData = RemoteData.success(jsonResponse.data);
    } else {
        remoteData = RemoteData.failure(jsonResponse.errors || [{ title: jsonResponse.error, detail: jsonResponse.message }]);
    }

    return { remoteData };
};
