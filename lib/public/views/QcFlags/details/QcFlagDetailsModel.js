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
import { dplDetectorsProvider } from '../../../services/detectors/dplDetectorsProvider.js';

/**
 * QC Flag details model
 */
export class QcFlagDetailsModel extends Observable {
    /**
     * Constructor
     * @param {number} [parameteres.id] QC flag id
     * @param {function} onDeleteSuccess callback in case the flag is successfuly deleted
     */
    constructor({
        id: qcFlagId,
    }, onDeleteSuccess) {
        super();
        this._onDeleteSuccess = onDeleteSuccess;

        this._qcFlagId = qcFlagId;

        this._qcFlag$ = new ObservableData(RemoteData.notAsked());
        this._qcFlag$.bubbleTo(this);

        this._deleteResult$ = new ObservableData(RemoteData.notAsked());
        this._deleteResult$.bubbleTo(this);

        dplDetectorsProvider.physical$.observe(() => this._getDetector());
        this._dplDetector$ = new ObservableData(RemoteData.notAsked());
        this._dplDetector$.bubbleTo(this);

        this._initilize();
    }

    /**
     * Initialize model
     *
     * @return {Promise<void>} promise
     */
    async _initilize() {
        await this._fetchQcFlag();
        this._qcFlag$.getCurrent().match({
            Success: (qcFlag) => {
                this._dplDetectorId = qcFlag.dplDetectorId;
                this._getDetector();
            },
            Other: () => null,
        });
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
     * Fetch DPL detector which for QC flag is to be created
     * @return {void}
     */
    _getDetector() {
        this._dplDetector$.setCurrent(dplDetectorsProvider.physical$.getCurrent().match({
            Success: (dplDetectors) => {
                const dplDetector = dplDetectors.find(({ id }) => id === this._dplDetectorId);
                return dplDetector
                    ? RemoteData.success(dplDetector)
                    : RemoteData.failure({ errors: [{ detail: `There is no dplDetector with given id (${this._dplDetectorId})` }] });
            },
            Failure: (payload) => RemoteData.failure(payload),
            Loading: () => RemoteData.loading(),
            NotAsked: () => RemoteData.notAsked(),
        }));
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
     * Get fetched QC flag with given id
     *
     * @return {RemoteData<QcFlag>} current QC flag
     */
    get qcFlag() {
        return this._qcFlag$.getCurrent();
    }

    /**
     * Returns the recently response to delete request
     *
     * @returns {RemoteData} response
     */
    get deleteResult() {
        return this._deleteResult$.getCurrent();
    }

    /**
     * Dpl Detector getter
     *
     * @return {RemoteData<DplDetector>} current detector
     */
    get dplDetector() {
        return this._dplDetector$.getCurrent();
    }
}
