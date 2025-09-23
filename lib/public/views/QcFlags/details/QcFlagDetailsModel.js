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
import { CreationModel } from '../../../models/CreationModel.js';
import { detectorsProvider } from '../../../services/detectors/detectorsProvider.js';

/**
 * QC Flag details model
 */
export class QcFlagDetailsModel extends Observable {
    /**
     * Constructor
     *
     * @param {object} parameters parameters for the model
     * @param {number} [parameters.id] QC flag id
     * @param {function} onDeleteSuccess callback in case the flag is successfully deleted
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

        detectorsProvider.qc$.observe(() => this._getDetector());
        this._detector$ = new ObservableData(RemoteData.notAsked());
        this._detector$.bubbleTo(this);

        this._verificationEnabled = false;
        this._verificationCreationModel = new QcFlagVerificationCreationModel(
            qcFlagId,
            () => {
                this.verificationEnabled = false;
                this._fetchQcFlag();
            },
        );
        this._verificationCreationModel.bubbleTo(this);

        this._initialize();
    }

    /**
     * Initialize model
     *
     * @return {Promise<void>} promise
     */
    async _initialize() {
        await this._fetchQcFlag();
        this._qcFlag$.getCurrent().match({
            Success: (qcFlag) => {
                this._detectorId = qcFlag.detectorId;
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
     *
     * @return {void}
     */
    _getDetector() {
        this._detector$.setCurrent(detectorsProvider.qc$.getCurrent().match({
            Success: (detectors) => {
                const detector = detectors.find(({ id }) => id === this._detectorId);
                return detector
                    ? RemoteData.success(detector)
                    : RemoteData.failure({ errors: [{ detail: `There is no detector with given id (${this._detectorId})` }] });
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
     * Set value stating whether verification forms should be displayed
     * @param {boolean} verificationEnabled true if the form should be displayed, false otherwise
     */
    set verificationEnabled(verificationEnabled) {
        this._verificationEnabled = verificationEnabled;
        this._verificationCreationModel.reset();
        this.notify();
    }

    /**
     * Get value stating whether verification forms should be displayed
     * @return {boolean} true if the form should be displayed, false otherwise
     */
    get verificationEnabled() {
        return this._verificationEnabled;
    }

    /**
     * Get verification creation model
     */
    get verificationCreationModel() {
        return this._verificationCreationModel;
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

    /**
     * Dpl Detector getter
     *
     * @return {RemoteData<DplDetector>} current detector
     */
    get detector() {
        return this._detector$.getCurrent();
    }
}

/**
 * QC flag verification creation model
 */
class QcFlagVerificationCreationModel extends CreationModel {
    /**
     * Constructor
     * @param {number} qcFlagId id of the QC flag
     * @param {function} onSuccess function called when the verification is successfully created
     */
    constructor(qcFlagId, onSuccess) {
        super(`/api/qcFlags/${qcFlagId}/verify`, onSuccess);
    }

    /**
     * @inheritDoc
     */
    _initOrResetData() {
        this.formData = {
            comment: null,
        };
    }

    /**
     * @inheritDoc
     */
    _getSerializableData() {
        return {
            comment: this.formData.comment || null,
        };
    }

    /**
     * Apply a patch on current form data
     *
     * @param {Partial<QcFlagVerificationCreationFormData>} patch the patch to apply
     * @return {void}
     */
    patchFormData(patch) {
        this.formData = { ...this.formData, ...patch };
        this.notify();
    }
}
