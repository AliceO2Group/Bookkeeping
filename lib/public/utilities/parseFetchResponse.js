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
 * For now, only handle array data
 *
 * @param {Response} response the response to parse for remote data
 * @param {array} [concatenateWith] the existing data to which received one must be concatenated
 *
 * @return {Promise<{remoteData: RemoteData, pageCount: number, totalCount: number}>} the parsed remote data and metadata
 */
export const parseFetchResponse = async (response, concatenateWith = null) => {
    let jsonResponse = {};

    // 204 means no data and the response do not have a body
    if (response.status === 204) {
        jsonResponse = { data: [], meta: { page: { pageCount: 1, totalCount: 0 } } };
    } else {
        jsonResponse = await response.json();
    }

    let remoteData;
    let pageCount;
    let totalCount;

    if (jsonResponse.meta && jsonResponse.meta.page) {
        ({ pageCount, totalCount } = jsonResponse.meta.page);
    }

    if (Array.isArray(jsonResponse.data)) {
        if (Array.isArray(concatenateWith)) {
            remoteData = RemoteData.success([...concatenateWith, ...jsonResponse.data]);
        } else {
            remoteData = RemoteData.success(jsonResponse.data);
            totalCount = totalCount || jsonResponse.data.length;
        }
    } else {
        remoteData = RemoteData.failure(jsonResponse.errors || [{ title: jsonResponse.error, detail: jsonResponse.message }]);
    }

    return { remoteData, pageCount, totalCount };
};
