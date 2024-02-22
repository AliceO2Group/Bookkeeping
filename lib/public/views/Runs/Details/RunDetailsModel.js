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
import { RunPatch } from './RunPatch.js';
import { TagPickerModel } from '../../../components/tag/TagPickerModel.js';
import { TabbedPanelModel } from '../../../components/TabbedPanel/TabbedPanelModel.js';
import { CollapsibleTreeNodeModel } from '../../../models/CollapsibleTreeNodeModel.js';
import { detectorsProvider } from '../../../services/detectors/detectorsProvider.js';
import { tagToOption } from '../../../components/tag/tagToOption.js';

export const RUN_DETAILS_PANELS_KEYS = {
    LOGS: 'logs',
    FLPS: 'flps',
    DPL_PROCESSES: 'dpl-processes',
};

/**
 * Model storing the state of the run detail page
 */
export class RunDetailsModel extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();

        this._runNumber = null;
        this._runId = null;
        this._runDetails = RemoteData.notAsked();
        this._eorReasonTypes = RemoteData.notAsked();
        this._allDetectors = RemoteData.notAsked();

        this.editionTagPickerModel = new TagPickerModel();
        this._runPatch = new RunPatch();
        this._runPatch.bubbleTo(this);

        this._tabbedPanelModel = new RunDetailsTabbedPanelModel();
        this._tabbedPanelModel.bubbleTo(this);

        this._updateErrors = [];
    }

    /**
     * Fetch all data related to run details
     * @param {number} [params.runNumber = null] the run Number of the run to display
     * @param {number} [params.runId = null] this paramtere is deprecated, use runNumber instead if feasible
     * @param {string} [params.panelKey = null] the key of the current panel
     * @return {Promise<void>} promise
     */
    async clearAndLoad({ runNumber = null, runId = null, panelKey = null }) {
        this.tabbedPanelModel.currentPanelKey = panelKey;
        this._updateErrors = [];

        if (this._runNumber !== runNumber || this._runId !== runId) {
            this.clearAllEditors();
            this._runNumber = runNumber;
            this._runId = runId;

            this._runDetails = RemoteData.notAsked();
            this._eorReasonTypes = RemoteData.notAsked();
            this._allDetectors = RemoteData.notAsked();

            this._fetchOneRun();
            this._fetchReasonTypes();
            this._fetchAllDetectors();
        }
    }

    /**
     * Getter for the current run
     *
     * @return {RemoteData} the run
     */
    get runDetails() {
        return this._runDetails;
    }

    /**
     * Getter for the current run number
     */
    get runNumber() {
        return this._runNumber;
    }

    /**
     * Getter for the EOR reason type
     *
     * @return {RemoteData} the EOR reason type
     */
    get eorReasonTypes() {
        return this._eorReasonTypes;
    }

    /**
     * Getter for all detectors
     *
     * @return {RemoteData} all detectors
     */
    get allDetectors() {
        return this._allDetectors;
    }

    /**
     * Retrieve a specified run from the API
     *
     * @return {Promise<void>} resolves once the run has been fetched
     */
    async _fetchOneRun() {
        this._runDetails = RemoteData.loading();
        this.notify();
        if (this._runNumber !== null) {
            return this._handleFetchRemoteRun(() => getRemoteData(`/api/runs/${this._runNumber}`));
        } else {
            return this._handleFetchRemoteRun(() => getRemoteData(`/api/legacy/runs/${this._runId}`));
        }
    }

    /**
     * Send updated RUN to be saved
     * @return {void}
     */
    async updateOneRun() {
        const { runNumber } = this._runDetails.payload;
        this._runDetails = RemoteData.loading();
        this._updateErrors = [];
        this.notify();

        const options = {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.runPatch.toPojo()),
        };

        try {
            await jsonFetch(`/api/runs/${runNumber}`, options);
        } catch (e) {
            this._updateErrors = e;
        }

        await this._fetchOneRun();
    }

    /**
     * Clear all editors in the model
     * @return {void}
     */
    clearAllEditors() {
        this._updateErrors = [];
        this._runPatch.reset();
        this._editionTagPickerModel.reset();
        this.newEorReason = {
            category: '',
            title: '',
            description: '',
        };
        this.isEditModeEnabled = false;
    }

    /**
     * Return if the edit mode is enabled or not
     */
    get isEditModeEnabled() {
        return this._isEditModeEnabled;
    }

    /**
     * Return the list of errors that occurred after update, if it applies
     *
     * @return {ApiError[]} the errors
     */
    get updateErrors() {
        return this._updateErrors;
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
     * States if the current patch is valid
     * @return {boolean} true if the patch is ready
     */
    get isEditionPatchValid() {
        return this._runPatch.isValid();
    }

    /**
     * Check if a similar eor_reason exists already in the list and if not, adds it to the eorReasonChanges to be saved
     * @return {void}
     */
    addNewEorReason() {
        const { category, title, description } = this.newEorReason;
        const reasonType =
            this._eorReasonTypes.payload.find((eorReasonType) => eorReasonType.category === category && eorReasonType.title === title);
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
        this._editionTagPickerModel.visualChange$.bubbleTo(this);
        this._editionTagPickerModel.observe(() => this._runPatch.setTags(this._editionTagPickerModel.selected));
    }

    /**
     * Returns the current run patch
     * @return {RunPatch} the current run patch
     */
    get runPatch() {
        return this._runPatch;
    }

    /**
     * Returns the model for bottom-page tabs
     *
     * @return {TabbedPanelModel} the tabs model
     */
    get tabbedPanelModel() {
        return this._tabbedPanelModel;
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
            this._runDetails = RemoteData.success(run);
            this._runPatch = new RunPatch(run);
            this._runPatch.bubbleTo(this);
            this.editionTagPickerModel = new TagPickerModel({ defaultSelection: run.tags.map(tagToOption) });
            this._tabbedPanelModel.runNumber = run.runNumber;
            this._runNumber = run.runNumber;
        } catch (error) {
            this._runDetails = RemoteData.failure(error);
        }

        this.notify();
    }

    /**
     * Retrieve a list of reason types from the API
     *
     * @return {Promise<void>} resolves once the data has been fetched
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
     * Retrieve a list of detector types from detectorsProvider
     *
     * @return {Promise<void>} resolves once the data has been fetched
     */
    async _fetchAllDetectors() {
        this._allDetectors = RemoteData.loading();
        this.notify();

        try {
            const allDetectors = await detectorsProvider.getAll();
            this._allDetectors = RemoteData.success(allDetectors);
        } catch (error) {
            this._allDetectors = RemoteData.failure(error);
        }

        this.notify();
    }
}

/**
 * Sub-model to store the bottom-page tabs model
 */
class RunDetailsTabbedPanelModel extends TabbedPanelModel {
    /**
     * Constructor
     */
    constructor() {
        super(Object.values(RUN_DETAILS_PANELS_KEYS));
        this._runNumber = null;
    }

    /**
     * Defines the current run number and fetch data accordingly
     *
     * @param {number} runNumber the number of the run to display
     */
    set runNumber(runNumber) {
        this._runNumber = runNumber;
        this._fetchCurrentPanelData();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _fetchCurrentPanelData() {
        switch (this.currentPanelKey) {
            case RUN_DETAILS_PANELS_KEYS.LOGS:
                this._fetchLogsPanelData();
                break;
            case RUN_DETAILS_PANELS_KEYS.FLPS:
                this._fetchFlpsPanelData();
                break;
            case RUN_DETAILS_PANELS_KEYS.DPL_PROCESSES:
                this._fetchDplTasksPanelData();
                break;
        }
    }

    /**
     * Retrieve all associated logs for the current run
     *
     * @returns {void}
     */
    async _fetchLogsPanelData() {
        this.currentPanelData = RemoteData.loading();
        this.notify();

        if (this._runNumber !== null) {
            try {
                const { data: logsOfRun } = await getRemoteData(`/api/runs/${this._runNumber}/logs`);
                this.currentPanelData = RemoteData.success(logsOfRun);
            } catch (error) {
                this.currentPanelData = RemoteData.failure(error);
            }
            this.notify();
        }
    }

    /**
     * Retrieve all associated FLPS for the current run
     *
     * @returns {void}
     */
    async _fetchFlpsPanelData() {
        this.currentPanelData = RemoteData.loading();
        this.notify();

        if (this._runNumber !== null) {
            try {
                const { data: flpsOfRun } = await getRemoteData(`/api/runs/${this._runNumber}/flps`);
                this.currentPanelData = RemoteData.success(flpsOfRun);
            } catch (error) {
                this.currentPanelData = RemoteData.failure(error);
            }

            this.notify();
        }
    }

    /**
     * Retrieve the list of DPL detectors for this run
     * @returns {Promise<void>} promise
     */
    async _fetchDplTasksPanelData() {
        this.currentPanelData = RemoteData.loading();
        this.notify();

        // While the run details have not been fetched, we do not have the run number, and we consider this tab to be loading
        if (this._runNumber !== null) {
            try {
                const { data: detectors } = await getRemoteData(`/api/dpl-process/detectors?runNumber=${this._runNumber}`);
                this.currentPanelData = RemoteData.success(detectors.map((detector) => {
                    const nodeModel = new DplDetectorTreeNodeModel(detector, this._runNumber);
                    nodeModel.bubbleTo(this);
                    return nodeModel;
                }));
            } catch (error) {
                this.currentPanelData = RemoteData.failure(error);
            }

            this.notify();
        }
    }
}

/**
 * Store a host tree node
 * @extends {CollapsibleTreeNodeModel<Host, DplProcessExecution>}
 */
export class HostTreeNodeModel extends CollapsibleTreeNodeModel {
    /**
     * Constructor
     *
     * @param {DplDetector} value the current value of the node
     * @param {number} runNumber the run number to which related processes executions must be linked to
     * @param {number} detectorId the detector id to which related processes executions must be linked to
     * @param {number} processId the process id to which related processes executions must be linked to
     */
    constructor(value, runNumber, detectorId, processId) {
        super(value);
        this._runNumber = runNumber;
        this._detectorId = detectorId;
        this._processId = processId;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    async fetchChildren() {
        const { id: hostId } = this.value;
        try {
            const { data: processesExecutions } =
                await getRemoteData('/api/dpl-process/executions?'
                    + `runNumber=${this._runNumber}`
                    + `&detectorId=${this._detectorId}`
                    + `&processId=${this._processId}`
                    + `&hostId=${hostId}`);
            this.children = RemoteData.success(processesExecutions);
        } catch (error) {
            this.children = RemoteData.failure(error);
        }
        this.notify();
    }
}

/**
 * Store a DPL process tree node
 * @extends {CollapsibleTreeNodeModel<DplProcess, HostTreeNodeModel>}
 */
export class DplProcessTreeNodeModel extends CollapsibleTreeNodeModel {
    /**
     * Constructor
     *
     * @param {DplDetector} value the current value of the node
     * @param {number} runNumber the run number to which related hosts must be linked to
     * @param {number} detectorId the detector id to which related hosts must be linked to
     */
    constructor(value, runNumber, detectorId) {
        super(value);
        this._runNumber = runNumber;
        this._detectorId = detectorId;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    async fetchChildren() {
        const { id: processId } = this.value;
        try {
            const { data: hosts } =
                await getRemoteData('/api/dpl-process/hosts?'
                    + `runNumber=${this._runNumber}`
                    + `&detectorId=${this._detectorId}`
                    + `&processId=${processId}`);
            this.children = RemoteData.success(hosts.map((host) => {
                const nodeModel = new HostTreeNodeModel(host, this._runNumber, this._detectorId, processId);
                nodeModel.bubbleTo(this);
                return nodeModel;
            }));
        } catch (error) {
            this.children = RemoteData.failure(error);
        }
        this.notify();
    }
}

/**
 * Store a DPL detector tree node
 * @extends {CollapsibleTreeNodeModel<DplDetector, DplProcessTreeNodeModel>}
 */
export class DplDetectorTreeNodeModel extends CollapsibleTreeNodeModel {
    /**
     * Constructor
     *
     * @param {DplDetector} value the current value of the node
     * @param {number} runNumber the run number to which related processes must be linked to
     */
    constructor(value, runNumber) {
        super(value);
        this._runNumber = runNumber;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    async fetchChildren() {
        const { id: detectorId } = this.value;
        try {
            const { data: processes } =
                await getRemoteData(`/api/dpl-process/processes?runNumber=${this._runNumber}&detectorId=${detectorId}`);
            this.children = RemoteData.success(processes.map((process) => {
                const nodeModel = new DplProcessTreeNodeModel(process, this._runNumber, detectorId);
                nodeModel.bubbleTo(this);
                return nodeModel;
            }));
        } catch (error) {
            this.children = RemoteData.failure(error);
        }
        this.notify();
    }
}
