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

import { RemoteData, Observable } from '/js/src/index.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';


/**
 * Model storing state of a selection of run types picked from the list of all the existing run types
 */
export class EorReasonFilterModel extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._eorReasonTypes = RemoteData.notAsked();
        this._fetchReasonTypes();
        this.newEorReason = {
            category: '',
            title: '',
            description: '',
        };
    }

    /**
     * Retrieve a list of reason types from the API
     *
     * @returns {Promise<void>} resolves once the data has been fetched
     */
    async _fetchReasonTypes() {
        this._eorReasonTypes = RemoteData.loading();
        this.notify();

        try {
            const { data: reasonTypes } = await getRemoteData('/api/runs/reasonTypes');
            this._eorReasonTypes = RemoteData.success(reasonTypes);
        } catch (error) {
            this._eorReasonTypes = RemoteData.failure(error);
        }

        this.notify();
    }

    /**
     * Getter for the EOR reason type
     *
     * @return {RemoteData} the EOR reason type
     */
    get eorReasonTypes() {
        return this._eorReasonTypes;
    }
}