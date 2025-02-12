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
 * Service class to fetch the list of all the existing magnets current levels
 */
export class MagnetsCurrentLevelsProvider extends RemoteDataProvider {
    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    async getRemoteData() {
        const { data } = await getRemoteData('/api/runs/aliceMagnetsCurrentLevels');
        return data
            .sort((
                { l3Level: l3LevelA, dipoleLevel: dipoleLevelA },
                { l3Level: l3LevelB, dipoleLevel: dipoleLevelB },
            ) => l3LevelA - l3LevelB || dipoleLevelA - dipoleLevelB);
    }
}

export const magnetsCurrentLevelsProvider = new MagnetsCurrentLevelsProvider();
