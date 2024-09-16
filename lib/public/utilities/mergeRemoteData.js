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
 * If at least one of them is RemoteData.Failure then RemoteData.Failure is returned, otherwise
 * If at least one of them is RemoteData.Loading then RemoteData.Loading is returned, otherwise
 * If at least one of them is RemoteData.NotAsked then RemoteData.NotAsked is returned, otherwise
 * RemoteData.Success with list of payloads of given remote data list with preserved order is returned
 *
 * @param {RemoteData[]} remoteDataList list of remote data
 * @param {object} [options] addiation options
 * @param {boolean} [options.flatErrorsList = true] if true errors from Failure remote data are merged to single list
 * @return {RemoteData} aggregated remote data
 */
export const mergeRemoteData = (remoteDataList, options = {}) => {
    const { flatErrorsList = true } = options;

    const remoteDataAggregation = remoteDataList.reduce((accumulator, remoteData) => remoteData.match({
        Success: (payload) => {
            accumulator.Success.push(payload);
            return accumulator;
        },
        Failure: (payload) => {
            if (flatErrorsList) {
                const { Failure: failuresAggregation } = accumulator;
                accumulator.Failure = [...failuresAggregation, ...payload];
            } else {
                accumulator.Failure.push(payload);
            }
            return accumulator;
        },
        Loading: () => {
            accumulator.Loading.push({});
            return accumulator;
        },
        NotAsked: () => {
            accumulator.NotAsked.push({});
            return accumulator;
        },
    }), {
        Success: [],
        Failure: [],
        Loading: [],
        NotAsked: [],
    });

    const { Success, Failure, Loading, NotAsked } = remoteDataAggregation;
    if (Failure.length > 0) {
        return RemoteData.failure(flatErrorsList ? Failure.flat() : Failure);
    }

    if (Loading.length > 0) {
        return RemoteData.loading();
    }

    if (NotAsked.length > 0) {
        return RemoteData.notAsked();
    }

    return RemoteData.success(Success);
};
