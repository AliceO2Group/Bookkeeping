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

import { RemoteData } from '/js/src/index.js';

/**
 * Merge list of remote data to single remote data instance according to following rules
 * If at least one of them is RemoteData.failure then RemoteData.failure is returned,
 *  whereby payload structure depends on @see options.compressFailurePayloads, otherwise
 * If at least one of them is RemoteData.loading then RemoteData.loading is returned, otherwise
 * If at least one of them is RemoteData.notAsked then RemoteData.notAsked is returned, otherwise
 * RemoteData.Success with list of payloads of given remote data list with preserved order is returned
 *
 * @param {RemoteData[]} remoteDataList list of remote data
 * @param {object} [options] addiational options
 * @param {boolean} [options.compressFailurePayloads = true] if it is false, order of payloads in resultant RemoteData.Failure
 * is the same as for the given list. In this case if some of the provided RemoteData is NOT Failure,
 * then resultatnt list has null values at corresponding positions.
 * If the option is true, all the possible untruthful values are removed and list of errors is flatten.
 * @return {RemoteData} aggregated remote data
 */
export const mergeRemoteData = (remoteDataList, options = {}) => {
    const { compressFailurePayloads = true } = options;

    const successPayloads = [];
    const failurePayloads = [];
    let isFailure = false;
    let isLoading = false;
    let isNotAsked = false;

    for (const remoteData of remoteDataList) {
        remoteData.match({
            Success: (payload) => {
                successPayloads.push(payload);
                failurePayloads.push(null);
            },

            Failure: (payload) => {
                isFailure = true;
                failurePayloads.push(payload);
            },

            Loading: () => {
                isLoading = true;
                failurePayloads.push(null);
            },

            NotAsked: () => {
                isNotAsked = true;
                failurePayloads.push(null);
            },
        });
    }

    if (isFailure) {
        return RemoteData.failure(compressFailurePayloads
            ? failurePayloads.filter((payload) => payload).flat()
            : failurePayloads);
    }

    if (isLoading) {
        return RemoteData.loading();
    }

    if (isNotAsked) {
        return RemoteData.notAsked();
    }

    return RemoteData.success(successPayloads);
};
