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

/**
 * @typedef DataSlice
 * @property {number} totalCount the total amount of items in the set the slide is extracted from
 * @property {Array} items the list of items contained in the slice
 */

import { getRemoteData } from './getRemoteData.js';

/**
 * Fetch a slice of data (for now, slice bounds must already be defined in the endpoint) alongside with the total amount items from which this
 * slice is a subset
 *
 * @param {string} endpoint the remote endpoint to send request to
 * @param {Object} options request options
 * @param {AbortSignal} [options.signal] optionally, an abort signal to abort the request
 * @return {Promise<DataSlice>} resolve with the page items and metadata, or reject with the list of errors
 */
export const getRemoteDataSlice = async (endpoint, { signal } = {}) => {
    const remoteJson = await getRemoteData(endpoint, { signal });

    const { data = [], meta = { page: { totalItems: 0 } } } = remoteJson || {};

    if (!Array.isArray(data)) {
        return Promise.reject([
            {
                title: 'Invalid response',
                detail: 'Server returned an invalid response',
            },
        ]);
    }

    const { totalCount = data.length } = meta.page || {};

    return { items: data, totalCount };
};
