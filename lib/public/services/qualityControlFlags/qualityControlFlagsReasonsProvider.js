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
 * Service class to fetch quality control flag reasons from the backend
 */
export class QualityControlFlagReasonsProvider extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._allFlagReasons = null;
    }

    /**
     * Returns the list of all the available quality control flag reasons
     * @return {Promise<Tag[]>} the list of all available tags
     */
    async getAll() {
        if (!this._allFlagReasons) {
            this._allFlagReasons = getRemoteData('/api/qualityControlFlags/reasons').then(({ data }) => data);
        }
        return this._allFlagReasons;
    }
}

export const qualityControlFlagReasonsProvider = new QualityControlFlagReasonsProvider();
