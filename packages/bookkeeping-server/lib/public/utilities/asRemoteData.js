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
 * Returns the given data as a remote data
 *
 * If data is already a remote data, returns it, else returns data wrapped as a success remote data
 *
 * @template T
 * @template E
 * @param {T|RemoteData<T, E>} data the data to wrap
 * @return {RemoteData<T, E>} the resulting remote data
 */
export const asRemoteData = (data) => data instanceof RemoteData ? data : RemoteData.success(data);
