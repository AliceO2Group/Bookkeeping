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
import { fetchClient, Observable, RemoteData } from '/js/src/index.js';

/**
 * Model for LHC fills details page
 */
export class LhcFillDetailsModel extends Observable {
    /**
     * Constructor
     *
     * @param {number|null} lhcFillId the ID ot the LHC fill this model represents
     */
    constructor(lhcFillId = null) {
        super();
        this.lhcFillId = lhcFillId;
    }

    /**
     * Return the LHC fill represented by this model
     *
     * @return {RemoteData} the current lhc fill
     */
    get lhcFill() {
        return this._lhcFill;
    }

    /**
     * Define the ID of the LHC fill handled by the current model and update data accordingly
     *
     * @param {number|null} lhcFillId the new fill ID
     *
     * @return {void}
     */
    set lhcFillId(lhcFillId) {
        if (lhcFillId === null) {
            this._lhcFill = RemoteData.notAsked();
        } else {
            this._lhcFill = RemoteData.Loading();
            this._fetchLhcFill(lhcFillId);
        }
    }

    /**
     * Retrieve a specified LHC fill from the API
     *
     * @param {number} lhcFillId The ID of the fill to be found
     * @returns {void} Injects the data object with the response data
     */
    async _fetchLhcFill(lhcFillId) {
        this._lhcFills = RemoteData.loading();
        this.notify();

        const response = await fetchClient(`/api/lhcFills/${lhcFillId}`, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            this._lhcFill = RemoteData.success(result.data);
        } else {
            this._lhcFill = RemoteData.failure(result.errors || [
                {
                    title: result.error,
                    detail: result.message,
                },
            ]);
        }
        this.notify();
    }
}
