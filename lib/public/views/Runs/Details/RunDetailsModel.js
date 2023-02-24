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
import { jsonFetch } from '../../../utilities/fetch/jsonFetch.js';
import { PickerModel } from '../../../components/common/selection/picker/PickerModel.js';
import { ToggleableModel } from '../../../components/common/toggle/TogglableModel.js';
import { tagToOptionWithArchiveBadge } from '../../../components/tag/tagToOptionWithArchiveBadge.js';
import { RunPatch } from './RunPatch.js';

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

        this.eorReasonTypes = RemoteData.notAsked();
        this.logsOfRun = RemoteData.notAsked();
        this.flpsOfRun = RemoteData.notAsked();

        this.editionTagPickerModel = new PickerModel();
        this._runPatch = new RunPatch();
        this._runPatch.bubbleTo(this);

        this.clearAllEditors();

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

        await this._handleFetchRemoteRun(() => getRemoteData(`/api/runs/${id}`));
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
            body: JSON.stringify(this.runPatch.toPojo()),
        };

        await this._handleFetchRemoteRun(() => jsonFetch(`/api/runs/${id}`, options));
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
        this.eorReasonTypes = RemoteData.loading();
        this.notify();

        try {
            const { data: reasonTypes } = await getRemoteData('/api/runs/reasonTypes');
            this.eorReasonTypes = RemoteData.success(reasonTypes);
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
        this._runPatch.reset();
        this._isEditModeEnabled = false;
        this._editionTagPickerModel.reset();
        this.newEorReason = {
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
     * Check if a similar eor_reason exists already in the list and if not, adds it to the eorReasonChanges to be saved
     * @returns {undefined}
     */
    addNewEorReason() {
        const { category, title, description } = this.newEorReason;
        const reasonType =
            this.eorReasonTypes.payload.find((eorReasonType) => eorReasonType.category === category && eorReasonType.title === title);
        if (reasonType) {
            this.runPatch.addEorReason({ reasonTypeId: reasonType.id, description });
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
        this._editionTagPickerModel.observe(() => this._runPatch.setTags(this._editionTagPickerModel.selected));
    }

    /**
     * Returns the model handling the toggle status of the detectors dropdown
     *
     * @return {ToggleableModel} the dropdown model
     */
    get editionDetectorsDropdownModel() {
        return this._editionDetectorsQualitiesDropdownModel;
    }

    /**
     * Returns the current run patch
     * @return {RunPatch} the current run patch
     */
    get runPatch() {
        return this._runPatch;
    }

    /**
     * Wrap the call to a function that fetch runs and update the model with the received data
     *
     * @param {function} fetchRuns the function that actually fetch runs
     * @return {Promise<void>} resolves once the runs are fetched and the model has been updated accordingly
     * @private
     */
    async _handleFetchRemoteRun(fetchRuns) {
        try {
            const { data: run } = await fetchRuns();
            this._run = RemoteData.success(run);
            this._runPatch = new RunPatch(run);
            this.editionTagPickerModel = new PickerModel(run.tags.map(tagToOptionWithArchiveBadge));
        } catch (error) {
            this._run = RemoteData.failure(error);
        }

        this.notify();
    }
}
