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
import { ToggleableModel } from '../../../components/common/toggle/TogglableModel.js';
import { tagToOptionWithArchiveBadge } from '../../../components/tag/tagToOptionWithArchiveBadge.js';
import { RunPatch } from './RunPatch.js';
import { TagPickerModel } from '../../../components/tag/TagPickerModel.js';
import { TabbedPanelModel } from '../../../components/TabbedPanel/TabbedPanelModel.js';
import { CollapsibleTreeNodeModel } from '../../../models/CollapsibleTreeNodeModel.js';
import { detectorsProvider } from '../../../services/detectors/detectorsProvider.js';

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
     *
     * @param {number} runId the id of the run to display
     * @param {string|null|undefined} [panelKey=null] the key of the current panel
     */
    constructor(runId, panelKey) {
        super();

        this._runId = runId;
        this._runDetails = RemoteData.notAsked();

        this._fetchOneRun();

        this.eorReasonTypes = RemoteData.notAsked();
        this._fetchReasonTypes();

        this.detectorTypes = RemoteData.notAsked();
        this._fetchDetectorTypes();

        this.editionTagPickerModel = new TagPickerModel();
        this._runPatch = new RunPatch();
        this._runPatch.bubbleTo(this);

        this.clearAllEditors();

        this._editionDetectorsQualitiesDropdownModel = new ToggleableModel();

        this._tabbedPanelModel = new RunDetailsTabbedPanelModel(runId, panelKey);
        this._tabbedPanelModel.bubbleTo(this);
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
     * Define the id of the run to fetch and fetch the related data
     *
     * @param {number} runId the id of the run to display
     */
    set runId(runId) {
        if (runId !== this._runId) {
            this._runId = runId;
            this._tabbedPanelModel.runId = runId;

            this.clearAllEditors();
            this._fetchOneRun();
            this._fetchReasonTypes();
        }
    }

    /**
     * Retrieve a specified run from the API
     *
     * @returns {Promise<void>} resolves once the run has been fetched
     */
    async _fetchOneRun() {
        this._runDetails = RemoteData.loading();
        this.notify();

        return this._handleFetchRemoteRun(() => getRemoteData(`/api/runs/${this._runId}`));
    }

    /**
     * Send updated RUN to be saved
     * @returns {void}
     */
    async updateOneRun() {
        const { id } = this._runDetails.payload;
        this._runDetails = RemoteData.loading();
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
        this._editionTagPickerModel.visualChange$.bubbleTo(this);
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
            this.editionTagPickerModel = new TagPickerModel({ defaultSelection: run.tags.map(tagToOptionWithArchiveBadge) });
            this._tabbedPanelModel.runNumber = run.runNumber;
        } catch (error) {
            this._runDetails = RemoteData.failure(error);
        }

        this.notify();
    }

    /**
     * Retrieve a list of reason types from the API
     *
     * @returns {Promise<void>} resolves once the data has been fetched
     */
    async _fetchReasonTypes() {
        this.eorReasonTypes = RemoteData.loading();
        this.notify();

        try {
            const { data: reasonTypes } = await getRemoteData('/api/runs/reasonTypes');
            this.eorReasonTypes = RemoteData.success(reasonTypes);
        } catch (error) {
            this.eorReasonTypes = RemoteData.failure(error);
        }

        this.notify();
    }
    
    async _fetchDetectorTypes() {
        this.detectorTypes = RemoteData.loading();
        this.notify();

        try {
            const detectorTypes = await detectorsProvider.getAll();
            this.detectorTypes = RemoteData.success(detectorTypes);
        } catch (error) {
            this.detectorTypes = RemoteData.failure(error);
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
     *
     * @param {number} runId the id of the current run
     * @param {string|null|undefined} [panelKey=null] the current panel key (null will use default)
     */
    constructor(runId, panelKey) {
        super(Object.values(RUN_DETAILS_PANELS_KEYS));
        this._runId = runId;
        // Run number is fetched with the run for now, so we do not have it in constructor yet
        this._runNumber = null;
        this.currentPanelKey = panelKey;
    }

    /**
     * Defines the current run and fetch data accordingly
     *
     * @param {number} runId the id of the run to display
     */
    set runId(runId) {
        this._runId = runId;
        this._fetchCurrentPanelData();
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

        try {
            const { data: logsOfRun } = await getRemoteData(`/api/runs/${this._runId}/logs`);
            this.currentPanelData = RemoteData.success(logsOfRun);
        } catch (error) {
            this.currentPanelData = RemoteData.failure(error);
        }

        this.notify();
    }

    /**
     * Retrieve all associated FLPS for the current run
     *
     * @returns {void}
     */
    async _fetchFlpsPanelData() {
        this.currentPanelData = RemoteData.loading();
        this.notify();

        try {
            const { data: flpsOfRun } = await getRemoteData(`/api/runs/${this._runId}/flps`);
            this.currentPanelData = RemoteData.success(flpsOfRun);
        } catch (error) {
            this.currentPanelData = RemoteData.failure(error);
        }

        this.notify();
    }

    /**
     * Retrieve the list of DPL detectors for this run
     *
     * @returns {void}
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
