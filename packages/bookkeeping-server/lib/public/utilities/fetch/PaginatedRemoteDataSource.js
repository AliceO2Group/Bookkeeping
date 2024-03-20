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
import { RemoteDataSource } from './RemoteDataSource.js';
import { getRemoteDataSlice } from './getRemoteDataSlice.js';

/**
 * Data source fetching paginated remote data
 */
export class PaginatedRemoteDataSource extends RemoteDataSource {
    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     * @return {Promise<{data: *, totalCount: number}>}
     */
    async getRemoteData(endpoint) {
        return getRemoteDataSlice(endpoint, { signal: this._abortController.signal });
    }
}
