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

import { RemoteDataProvider } from '../RemoteDataProvider.js';
import { getRemoteData } from '../../utilities/fetch/getRemoteData.js';

/**
 * Provider for EoR reasons type
 */
export class EorReasonTypeProvider extends RemoteDataProvider {
    /**
     * @inheritDoc
     */
    async getRemoteData() {
        const { data } = await getRemoteData('/api/runs/reasonTypes');
        return data;
    }
}

export const eorReasonTypeProvider = new EorReasonTypeProvider();
