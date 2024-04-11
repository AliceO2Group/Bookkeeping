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
import { detectorsProvider } from '../../../services/detectors/detectorsProvider.js';

/**
 * Quality Control Flag Creation model
 */
export class QualityControlFlagDetailsModel extends Observable {
    /**
     * Constructor
     */
    constructor({
        flagId,
        externalUserId,
        onVerifySuccess,
        onDeleteSuccess,
    }) {
        super();
        this._onVerifySuccess = onVerifySuccess;
        this._onDeleteSuccess = onDeleteSuccess;

        this._flagId = flagId;

        this._observableFlag = new ObservableData(RemoteData.notAsked());
        this._observableFlag.bubbleTo(this);

        this._externalUserId = externalUserId;
        this._comment = null;

        this._observableDeleteResult = new ObservableData(RemoteData.notAsked());
        this._observableDeleteResult.bubbleTo(this);

        this._observableVerifyResult = new ObservableData(RemoteData.notAsked());
        this._observableVerifyResult.bubbleTo(this);

        this._observableRun = new ObservableData(RemoteData.notAsked());
        this._observableRun.bubbleTo(this);
        this._observableDataPass = new ObservableData(RemoteData.notAsked());
        this._observableDataPass.bubbleTo(this);
        this._observableDetector = new ObservableData(RemoteData.notAsked());
        this._observableDetector.bubbleTo(this);

        this._observableVerifications = new ObservableData(RemoteData.notAsked());
        this._observableVerifications.bubbleTo(this);

        this._initilize();
    }

    /**
     *
     */
    async _initilize() {
        await this._fetchFlag();
    }

    /**
     * Fetch run data
     * @return {Promise<void>} promise
     */
    async _fetchFlag() {
        this._observableFlag.setCurrent(RemoteData.loading());
        try {
            const { data: [flag] } = await getRemoteData(`/api/qualityControlFlags?filter[ids][]=${this._flagId}`);
            this._runNumber = flag.runNumber;
            this._dataPassId = flag.dataPassId;
            this._detectorId = flag.detectorId;

            this._observableFlag.setCurrent(RemoteData.success(flag));
            this._observableVerifications.setCurrent(RemoteData.success(flag.verifications));
            this._fetchRun();
            this._fetchDataPass();
            this._fetchDetector();
        } catch (error) {
            this._observableFlag.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * Fetch run data
     * @return {Promise<void>} promise
     */
    async _fetchRun() {
        this._observableRun.setCurrent(RemoteData.loading());
        try {
            const { data: run } = await getRemoteData(`/api/runs/${this._runNumber}`);
            this._observableRun.setCurrent(RemoteData.success(run));
        } catch (error) {
            this._observableRun.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * Fetch detector data
     * @return {Promise<void>} promise
     */
    async _fetchDetector() {
        this._observableDetector.setCurrent(RemoteData.loading());
        try {
            const allDetectors = await detectorsProvider.getAll();
            const targetDetector = allDetectors.find(({ id }) => this._detectorId === id);
            if (!targetDetector) {
                throw new Error('Cannot fetch detectors');
            }
            this._observableDetector.setCurrent(RemoteData.success(targetDetector));
        } catch (error) {
            this._observableDetector.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * Fetch data pass data
     * @return {Promise<void>} promise
     */
    async _fetchDataPass() {
        this._observableDataPass.setCurrent(RemoteData.loading());
        try {
            const { data: [dataPass] } = await getRemoteData(`/api/dataPasses/?filter[ids][]=${this._dataPassId}`);
            this._observableDataPass.setCurrent(RemoteData.success(dataPass));
        } catch (error) {
            this._observableDataPass.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     *
     */
    async delete() {
        const options = {
            method: 'DELETE',
            headers: { 'Content-type': 'application/json' },
        };

        try {
            this._observableDeleteResult.setCurrent(RemoteData.loading());
            const result = await jsonFetch(`/api/qualityControlFlags/${this._flagId}`, options);
            this._observableDeleteResult.setCurrent(RemoteData.success(result));
            if (this._onDeleteSuccess) {
                this._onDeleteSuccess({
                    runNumber: this._observableRun.getCurrent().payload.runNumber,
                    dataPassId: this._observableDataPass.getCurrent().payload.id,
                    detectorId: this._observableDetector.getCurrent().payload.id,
                });
            }
        } catch (error) {
            this._observableDeleteResult.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     *
     */
    async verify() {
        const body = {
            qualityControlFlagId: this._flagId,
            comment: this._comment,
            externalUserId: this._externalUserId,
        };

        const options = {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(body),
        };

        try {
            this._observableVerifyResult.setCurrent(RemoteData.loading());
            const result = await jsonFetch('/api/qualityControlFlags/verify', options);
            this._observableVerifyResult.setCurrent(RemoteData.success(result));
            this.reset();
            if (this._onVerifySuccess) {
                this._onVerifySuccess();
            }
            this._fetchFlag();
        } catch (error) {
            this._observableVerifyResult.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     *
     */
    get verifyResult() {
        return this._observableVerifyResult.getCurrent();
    }

    /**
     *
     */
    get deleteResult() {
        return this._observableDeleteResult.getCurrent();
    }

    /**
     *
     */
    set comment(comment) {
        this._comment = comment;
    }

    /**
     *
     */
    get comment() {
        return this._comment;
    }

    reset() {
        this._comment = null;
    }
}
