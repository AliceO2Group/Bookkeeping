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

import { Observable, RemoteData } from '/js/src/index.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';
import { tagToOption } from '../../../components/tag/tagToOption.js';
import { jsonFetch } from '../../../utilities/fetch/jsonFetch.js';
import { PickerModel } from '../../../components/common/selection/picker/PickerModel.js';
import { ToggleableModel } from '../../../components/common/toggle/TogglableModel.js';

/**
 * Model storing the state of the run detail page
 */
export class RunDetailsModel extends Observable {
    /**
     * Constructor
     *
     * @TODO Remove the model dependency
     *
     * @param {Model} model the global model
     */
    constructor(model) {
        super();
        this.model = model;
        this._run = RemoteData.notAsked();

        /**
         * Stores, for each detector, its current quality
         * @type {Map<number, string>}
         * @private
         */
        this._detectorsQualities = new Map();

        this.reasonTypes = RemoteData.notAsked();
        this.logsOfRun = RemoteData.notAsked();
        this.flpsOfRun = RemoteData.notAsked();

        this.editionTagPickerModel = new PickerModel();
        this.clearAllEditors();

        /**
         * Stores, for each detector the new quality if it is different from the current one
         * @type {Map<number, string>}
         * @private
         */
        this._editionDetectorsQualities = new Map();
        this._editionDetectorsQualitiesDropdownModel = new ToggleableModel();
    }

    /**
     * Retrieve a specified run from the API
     *
     * @param {Number} id The ID of the run to be found
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchOneRun(id) {
        this._run = RemoteData.loading();
        this.notify();

        try {
            const { data: run } = await getRemoteData(`/api/runs/${id}`);
            this._run = RemoteData.success(run);
            this.editionTagPickerModel = new PickerModel(run.tags.map(tagToOption));
            for (const { id, quality } of run.detectorsQualities) {
                this._detectorsQualities.set(id, quality);
            }
        } catch (error) {
            this._run = RemoteData.failure(error);
        }

        this.notify();
    }

    /**
     * Send updated RUN to be saved
     * @returns {undefined} Injects the data object with the response data
     */
    async updateOneRun() {
        const { id } = this._run.payload;
        this._run = RemoteData.loading();
        this.notify();

        const options = {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.runChanges),
        };

        try {
            const { data: run } = await jsonFetch(`/api/runs/${id}`, options);
            this._run = RemoteData.success(run);
            this.editionTagPickerModel = new PickerModel(run.tags.map(tagToOption));
            for (const { id, quality } of run.detectorsQualities) {
                this._detectorsQualities.set(id, quality);
            }
        } catch (error) {
            this._run = RemoteData.failure(error);
        }

        this.notify();
    }

    /**
     * Getter for the current run
     *
     * @return {RemoteData} the run
     */
    get run() {
        return this._run;
    }

    /**
     * Retrieve all associated logs for a specified run from the API
     * @param {Number} id The ID of the run to be found
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchLogsOfRun(id) {
        this.logsOfRun = RemoteData.loading();
        this.notify();

        try {
            const { data: logsOfRun } = await getRemoteData(`/api/runs/${id}/logs`);
            this.logsOfRun = RemoteData.success(logsOfRun);
        } catch (error) {
            this.logsOfRun = RemoteData.failure(error);
        }

        this.notify();
    }

    /**
     * Getter for Logs data associated with a singular run
     * @returns {RemoteData} Returns the logs of a run
     */
    getLogsOfRun() {
        return this.logsOfRun;
    }

    /**
     * Retrieve all associated logs for a specified run from the API
     * @param {Number} id The ID of the run to be found
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchFlpsOfRun(id) {
        this.flpsOfRun = RemoteData.loading();
        this.notify();

        try {
            const { data: flpsOfRun } = await getRemoteData(`/api/runs/${id}/flps`);
            this.flpsOfRun = RemoteData.success(flpsOfRun);
        } catch (error) {
            this.logsOfRun = RemoteData.failure(error);
        }

        this.notify();
    }

    /**
     * Getter for Logs data associated with a singular run
     * @returns {RemoteData} Returns the logs of a run
     */
    getFlpsOfRun() {
        return this.flpsOfRun;
    }

    /**
     * Retrieve a list of reason types from the API
     * @returns {undefined} Injects the list of reasons with response data
     */
    async fetchReasonTypes() {
        this.reasonTypes = RemoteData.loading();
        this.notify();

        try {
            const { data: reasonTypes } = await getRemoteData('/api/runs/reasonTypes');
            this.reasonTypes = RemoteData.success(reasonTypes);
        } catch (error) {
            this.logsOfRun = RemoteData.failure(error);
        }

        this.notify();
    }

    /**
     * Clear all editors in the model
     * @returns {void}
     */
    clearAllEditors() {
        this.editionTagPickerModel.reset();
        this._editionDetectorsQualities = new Map();
        this._isEditModeEnabled = false;
        this._runChanges = {};
        this.eorNewReason = {
            category: '',
            title: '',
            description: '',
        };
    }

    /**
     * Return if the edit mode is enabled or not
     */
    get isEditModeEnabled() {
        return this._isEditModeEnabled;
    }

    /**
     * Set the value of the edit mode of a Run and update the watchers
     * @param {boolean} value parameter to specify if user is in edit mode
     */
    set isEditModeEnabled(value) {
        this._isEditModeEnabled = value;
        this.notify();
    }

    /**
     * Return the changes that user applied while in Edit Mode
     */
    get runChanges() {
        return this._runChanges;
    }

    /**
     * Method to update the property of a run;
     * If there is a missing key and value, all changes will be dropped
     * @param {Object} object containing a key and a value which represent the property of the run that is being changed
     */
    set runChanges({ key, value }) {
        if (!key && !value) {
            this._runChanges = {};
        } else {
            this._runChanges[key] = value;
        }
        this.notify();
    }

    /**
     * Returns the quality assigned for a given detector
     *
     * @param {number} detectorId the id of the detector
     * @return {string|undefined} the quality
     */
    getEditionRunDetectorQuality(detectorId) {
        return this._editionDetectorsQualities.get(detectorId);
    }

    /**
     * Defines the quality of a given detector
     *
     * @param {number} detectorId the id of the detector
     * @param {string} quality the quality of the detector
     * @return {void}
     */
    setEditionRunDetectorQuality(detectorId, quality) {
        if (this._detectorsQualities.get(detectorId) === quality) {
            this._editionDetectorsQualities.delete(detectorId);
        } else {
            this._editionDetectorsQualities.set(detectorId, quality);
        }

        // Update the run changes object
        const detectorsQualities = [];
        for (const [detectorId, quality] of this._editionDetectorsQualities.entries()) {
            detectorsQualities.push({ detectorId, quality });
        }
        this.runChanges.detectorsQualities = detectorsQualities;
    }

    /**
     * Check if a similar eor_reason exists already in the list and if not, adds it to the eorReasonChanges to be saved
     * @returns {undefined}
     */
    addEorReasonChange() {
        const { category, title, description } = this.eorNewReason;
        const isNew = this.runChanges.eorReasons.every((reason) =>
            reason.category !== category ||
            reason.title !== title ||
            reason.description !== description);
        if (isNew && category) {
            const reasonTypeIndex = this.reasonTypes.payload.findIndex((reason) => reason.category === category && reason.title === title);
            if (reasonTypeIndex > -1) {
                this.runChanges.eorReasons.push({
                    category,
                    title,
                    description,
                    reasonTypeId: this.reasonTypes.payload[reasonTypeIndex].id,
                    runId: this.model.router.params.id,
                    lastEditedName: this.model.session.name, // For now sent by front-end; To be moved on backend
                });
            }
        }
    }

    /**
     * Returns the model handling the tag picking for run update
     *
     * @return {PickerModel} the picker model
     */
    get editionTagPickerModel() {
        return this._editionTagPickerModel;
    }

    /**
     * Set the current edition tag picker model and register required observers
     *
     * @param {PickerModel} editionTagPickerModel the new tag picker model
     */
    set editionTagPickerModel(editionTagPickerModel) {
        this._editionTagPickerModel = editionTagPickerModel;
        this._editionTagPickerModel.observe(() => {
            this.runChanges = { key: 'tags', value: this.editionTagPickerModel.selected };
        });
    }

    /**
     * Returns the model handling the toggle status of the detectors dropdown
     *
     * @return {ToggleableModel} the dropdown model
     */
    get editionDetectorsDropdownModel() {
        return this._editionDetectorsQualitiesDropdownModel;
    }
}
