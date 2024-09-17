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
 * If the option is true, all the possible null values are removed and list of errors is flatten.
 * @return {RemoteData} aggregated remote data
 */
export const mergeRemoteData = (remoteDataList, options = {}) => {
    const { compressFailurePayloads = true } = options;

    const remoteDataAggregation = remoteDataList.reduce((accumulator, remoteData) => remoteData.match({
        Success: (payload) => {
            if (!compressFailurePayloads) {
                accumulator.failure.push(null);
            }
            accumulator.success.push(payload);
            return accumulator;
        },

        Failure: (payload) => {
            if (compressFailurePayloads) {
                const { failure: failuresAggregation } = accumulator;
                accumulator.failure = [...failuresAggregation, ...payload];
            } else {
                accumulator.failure.push(payload);
            }
            return accumulator;
        },

        Loading: () => {
            if (!compressFailurePayloads) {
                accumulator.failure.push(null);
            }
            accumulator.loading = true;
            return accumulator;
        },

        NotAsked: () => {
            if (!compressFailurePayloads) {
                accumulator.failure.push(null);
            }
            accumulator.notAsked = true;
            return accumulator;
        },
    }), {
        success: [],
        failure: [],
        loading: false,
        notAsked: false,
    });

    const { success, failure, loading, notAsked } = remoteDataAggregation;

    if (failure.filter((payload) => payload !== null).length > 0) {
        return RemoteData.failure(failure);
    }

    if (loading) {
        return RemoteData.loading();
    }

    if (notAsked) {
        return RemoteData.notAsked();
    }

    return RemoteData.success(success);
};
