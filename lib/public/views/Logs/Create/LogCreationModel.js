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
import { jsonFetch } from '../../../utilities/fetch/jsonFetch.js';
import { TagPickerModel } from '../../../components/tag/TagPickerModel.js';

const DATA_DISPLAY_DELIMITER = ',';

/**
 * @typedef LogCreationRelations
 * @property {number[]} [runNumbers] run numbers associated with log being created
 * @property {number[]} [lhcFillNumbers] lhc fill numbers associated with log being created
 * @property {number[]} [environmentIds] environment ids associated with log being created
 */

/**
 * Model to cary log creation state
 */
export class LogCreationModel extends Observable {
    /**
     * Constructor
     *
     * @param {function} [onCreation] function called when log is created, with the id of the created log
     * @param {LogCreationRelations} relations the relations of the log
     */
    constructor(onCreation, relations) {
        super();

        this._onCreation = onCreation;

        this._title = '';
        this._text = '';
        this._creationTagsPickerModel = new TagPickerModel();
        this._creationTagsPickerModel.bubbleTo(this);
        this._creationTagsPickerModel.visualChange$.bubbleTo(this);

        const { runNumbers = [], environmentIds = [], lhcFillNumbers = [] } = relations;
        this._runNumbers = runNumbers.join(DATA_DISPLAY_DELIMITER);
        this._lhcFills = lhcFillNumbers.join(DATA_DISPLAY_DELIMITER);
        this._environments = environmentIds.join(DATA_DISPLAY_DELIMITER);
        this._isRunNumbersReadonly = Boolean(this._runNumbers);

        this._parentLogId = null;

        this._attachments = [];

        this._createdLog = RemoteData.notAsked();
        this._isRunNumbersReadonly = false;
    }

    /**
     * Returns whether parent log is collapsed
     *
     * @return {boolean} true if collapsed
     */
    get isParentLogCollapsed() {
        return this._isParentLogCollapsed;
    }

    /**
     * Defines if the parent log is collapsed
     * @param {boolean} collapsed true if the parent log is collapsed
     */
    set isParentLogCollapsed(collapsed) {
        this._isParentLogCollapsed = collapsed;
        this.notify();
    }

    /**
     * Create the log with the variables set in the model, handling errors appropriately
     * Adds the title of the parent log to a log reply if the title is empty.
     * @returns {undefined}
     */
    async submit() {
        if (!this.isValid) {
            throw new Error('Created log is not valid');
        }

        if (this._createdLog.isLoading()) {
            throw new Error('A log is currently being sent');
        }

        this._createdLog = RemoteData.loading();
        this.notify();

        const { title, text, parentLogId, runNumbers, environments, lhcFills, attachments } = this;
        const tagsTexts = this._creationTagsPickerModel.selected;
        const environmentsIds = environments ? environments.split(',').map((environment) => environment.trim()) : [];
        const lhcFillNumbers = lhcFills ? lhcFills.split(',').map((lhcFillNumber) => lhcFillNumber.trim()) : [];

        const body = {
            title,
            text,
            ...parentLogId !== null && { parentLogId },
            ...runNumbers && { runNumbers },
        };

        const options = {
            method: 'POST',
            headers: { Accept: 'application/json' },
        };

        if (attachments.length > 0 || tagsTexts.length > 0 || environmentsIds.length > 0 || lhcFillNumbers.length > 0) {
            // eslint-disable-next-line no-undef
            const formData = new FormData();
            Object.entries(body).forEach(([key, value]) => formData.append(key, value));
            environmentsIds.forEach((environmentId) => formData.append('environments[]', environmentId));
            lhcFillNumbers.forEach((fillNumber) => formData.append('lhcFills[]', fillNumber));
            tagsTexts.forEach((tagText) => formData.append('tags[]', tagText));
            [...attachments].forEach((attachment, index) => formData.append(`attachments.${index}`, attachment));

            options.body = formData;
        } else {
            options.body = JSON.stringify(body);
            options.headers['Content-Type'] = 'application/json';
        }

        try {
            const { data: createdLog } = await jsonFetch('/api/logs', options);
            this._createdLog = RemoteData.success(createdLog);
            this._onCreation(createdLog.id);
        } catch (errors) {
            this._createdLog = RemoteData.failure(errors);
            this.notify();
        }
    }

    /**
     * Flushes all attachments of the current log being created
     * @returns {undefined}
     */
    clearAttachments() {
        document.getElementById('attachments').value = '';
        this.attachments = [];
        this.notify();
    }

    /**
     * Returns the current title of the log
     *
     * @return {string} the title
     */
    get title() {
        return this._title;
    }

    /**
     * Set the current title of the log
     *
     * @param {string} value the new title
     */
    set title(value) {
        this._title = value;
        this.notify();
    }

    /**
     * Returns the current text of the log
     *
     * @return {string} the text
     */
    get text() {
        return this._text;
    }

    /**
     * Set the current text of the log
     *
     * @param {string} value the new text
     */
    set text(value) {
        this._text = value;
        this.notify();
    }

    /**
     * Returns the picker model for tag selection
     *
     * @return {PickerModel} the model
     */
    get tagsPickerModel() {
        return this._creationTagsPickerModel;
    }

    /**
     * Returns the run numbers to which the log will be linked to, as a comma separated string
     *
     * @return {string} the run numbers
     */
    get runNumbers() {
        return `${this._runNumbers}`;
    }

    /**
     * Set the current run numbers to which the log will be linked to, as a comma separated string
     *
     * @param {string} value the new run numbers list
     */
    set runNumbers(value) {
        this._runNumbers = value;
        this.notify();
    }

    /**
     * Returns the environments which the log will be linked to, as a comma separated string
     *
     * @returns {string} the environment IDs
     */
    get environments() {
        return `${this._environments}`;
    }

    /**
     * Returns the LHC Fills which the log will be linked to, as a comma separated string
     *
     * @returns {string} the LHC fill numbers
     */
    get lhcFills() {
        return `${this._lhcFills}`;
    }

    /**
     * Set the environments which the log will be linked to, as a comma separated string
     *
     * @param {string} value the new environment IDs list
     */
    set environments(value) {
        this._environments = value;
        this.notify();
    }

    /**
     * Set the current lhc fills to which the log will be linked to, as a comma separated string
     *
     * @param {string} value the new run numbers list
     */
    set lhcFills(value) {
        this._lhcFills = value;
        this.notify();
    }

    /**
     * Returns the id of the parent log if it exists
     *
     * @return {number|undefined} the parent log's id
     */
    get parentLogId() {
        return this._parentLogId;
    }

    /**
     * Returns the list of files attachments linked to the log being created
     *
     * @return {FileList} the attached files
     */
    get attachments() {
        return this._attachments;
    }

    /**
     * Define one or more attachments to link to the log being created
     *
     * @param {FileList} files files to attach
     */
    set attachments(files) {
        this._attachments = files;
        this.notify();
    }

    /**
     * Return the created log as a remote data if it applies
     *
     * @return {RemoteData} the created log
     */
    get createdLog() {
        return this._createdLog;
    }

    /**
     * States if the currently created log is valid
     *
     * @return {boolean} true if the log is valid
     */
    get isValid() {
        return this.title.length >= 3 && this.text.length >= 3;
    }

    /**
     * States if the run numbers list can be edited
     *
     * @return {boolean} true if the run number CAN NOT be edited
     */
    get isRunNumbersReadonly() {
        return this._isRunNumbersReadonly;
    }
}
