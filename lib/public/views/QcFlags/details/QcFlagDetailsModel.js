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

import { ObservableData } from '../../../utilities/ObservableData.js';
import { jsonFetch } from '../../../utilities/fetch/jsonFetch.js';
import { RemoteData, Observable } from '/js/src/index.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';

/**
 * QC Flag details model
 */
export class QcFlagDetailsModel extends Observable {
    /**
     * Constructor
     *
     * @param {number} [parameteres.id] QC flag id
     * @param {function} onDeleteSuccess callback in case the flag is successfuly deleted
     */
    constructor(
        { id: qcFlagId },
        onDeleteSuccess,
    ) {
        super();
        this._onDeleteSuccess = onDeleteSuccess;

        this._qcFlagId = qcFlagId;

        this._qcFlag$ = new ObservableData(RemoteData.notAsked());
        this._qcFlag$.bubbleTo(this);

        this._deleteResult$ = new ObservableData(RemoteData.notAsked());
        this._deleteResult$.bubbleTo(this);

        this._initilize();
    }

    /**
     * Initialize model
     *
     * @return {Promise<void>} promise
     */
    async _initilize() {
        await this._fetchQcFlag();
    }

    /**
     * Fetch run data
     *
     * @return {Promise<void>} promise
     */
    async _fetchQcFlag() {
        this._qcFlag$.setCurrent(RemoteData.loading());
        try {
            const { data: qcFlag } = await getRemoteData(`/api/qcFlags/${this._qcFlagId}`);
            this._qcFlag$.setCurrent(RemoteData.success(qcFlag));
        } catch (error) {
            this._qcFlag$.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * Submit request to delete current QC flag, handling errors appropriately
     *
     * @returns {void}
     */
    async delete() {
        const options = {
            method: 'DELETE',
            headers: { 'Content-type': 'application/json' },
        };

        try {
            this._deleteResult$.setCurrent(RemoteData.loading());
            const result = await jsonFetch(`/api/qcFlags/${this._qcFlagId}`, options);
            this._deleteResult$.setCurrent(RemoteData.success(result));
            if (this._onDeleteSuccess) {
                this._onDeleteSuccess();
            }
        } catch (error) {
            this._deleteResult$.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * Get fetched QC flag
     *
     * @return {RemoteData<QcFlag>} current QC flag
     */
    get qcFlag() {
        return this._qcFlag$.getCurrent();
    }

    /**
     * Returns the recent response of delete request
     *
     * @returns {RemoteData} response
     */
    get deleteResult() {
        return this._deleteResult$.getCurrent();
    }
}
