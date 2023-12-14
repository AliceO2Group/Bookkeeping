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

import { Observable } from '/js/src/index.js';
import { getRemoteData } from '../../utilities/fetch/getRemoteData.js';

/**
 * Service class to fetch detectors from the backend
 */
export class DetectorsProvider extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._allDetectors = null;
    }

    /**
     * Returns the list of all the available detectors
     *
     * @return {Promise<Detector[]>} the list of all detectors
     */
    async getAll() {
        if (!this._allDetectors) {
            const { data } = await getRemoteData('/api/detectors');
            this._allDetectors = data;
        }

        return this._allDetectors;
    }
}

export const detectorsProvider = new DetectorsProvider();
