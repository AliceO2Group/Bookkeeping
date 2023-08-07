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
import { tagToOption } from '../../../components/tag/tagToOption.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';
import { TagPickerModel } from '../../../components/tag/TagPickerModel.js';

/**
 * Model to cary log creation state
 */
export class LogCreationModel extends Observable {
    /**
     * Constructor
     *
     * @param {function} [onCreation] function called when log is created, with the id of the created log
     * @param {number|string} [runNumber] optionally the run number to which the log must be linked to
     * @param {number} [parentLogId] optionally the id of log that will be the parent of the created one
     */
    constructor(onCreation, runNumber, parentLogId) {
        super();

        this._onCreation = onCreation;

        this._title = '';
        this._text = '';
        this._creationTagsPickerModel = new TagPickerModel();
        this._creationTagsPickerModel.bubbleTo(this);
        this._creationTagsPickerModel.visualChange$.bubbleTo(this);

        this._runNumbers = runNumber || '';
        this._environments = '';
        this._parentLogId = parentLogId;
        if (parentLogId) {
            this._parentLog = RemoteData.loading();
            getRemoteData(`/api/logs/${parentLogId}`).then(
                ({ data: parentLog }) => {
                    this.parentLog = RemoteData.success(parentLog);
                },
                (errors) => {
                    this.parentLog = RemoteData.failure(errors);
                },
            );
        } else {
            this._parentLog = RemoteData.success(null);
        }

        this._attachments = [];

        this._createdLog = RemoteData.notAsked();
        this._parentLogId = parentLogId;
        this._isRunNumbersReadonly = this._runNumbers;

        this._textEditor = null;
    }

    /**
     * Create the log with the variables set in the model, handling errors appropriately
     * Adds the title of the parent log to a log reply if the title is empty.
     * @returns {undefined}
     */
    async submit() {
        if (!this.isReady) {
            throw new Error('Log creation is not ready, please wait');
        }

        if (!this.isValid) {
            throw new Error('Created log is not valid');
        }

        if (this._createdLog.isLoading()) {
            throw new Error('A log is currently being sent');
        }

        this._createdLog = RemoteData.loading();
        this.notify();

        const { title, text, parentLogId, runNumbers, environments, attachments } = this;
        const tagsTexts = this.tagsPickerModel.selected;
        const environmentsTexts = environments ? environments.split(',').map((x) => x.trim()) : [];

        const body = {
            title,
            text,
            ...parentLogId > 0 && { parentLogId },
            ...runNumbers && { runNumbers },
        };

        const options = {
            method: 'POST',
            headers: { Accept: 'application/json' },
        };

        if (attachments.length > 0 || tagsTexts.length > 0 || environmentsTexts.length > 0) {
            // eslint-disable-next-line no-undef
            const formData = new FormData();
            Object.entries(body).forEach(([key, value]) => formData.append(key, value));
            environmentsTexts.forEach((envText) => formData.append('environments[]', envText));
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
     * Set the environments which the long will be linked to, as a comma separated string
     *
     * @param {string} value the new environment IDs list
     */
    set environments(value) {
        this._environments = value;
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
     * Returns the current parent log as a remote data
     * If the log do not have a parent log, the value will be success(null)
     *
     * @return {RemoteData} the parent log
     */
    get parentLog() {
        return this._parentLog;
    }

    /**
     * Set the parent log and use its values to define default values for the created log
     *
     * @param {RemoteData} parentLog the new parent log as a remote data
     */
    set parentLog(parentLog) {
        this._parentLog = parentLog;
        if (parentLog.isSuccess()) {
            const { title, tags, runs } = parentLog.payload;

            this.title = `${title}`;

            if (this.tagsPickerModel.hasOnlyDefaultSelection()) {
                this.tagsPickerModel.selectedOptions = tags.map(tagToOption);
            }
            if (!this.runNumbers) {
                this.runNumbers = runs.map(({ runNumber }) => runNumber).join(', ');
            }
        }
        this.notify();
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
     * States if the log creation model is ready
     *
     * @return {boolean} true if the model is ready
     */
    get isReady() {
        return this._parentLog.isSuccess();
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

    /**
     * Return the markdown editor used to edit log's text
     *
     * @return {Object} the editor
     */
    get textEditor() {
        return this._textEditor;
    }

    /**
     * Set the markdown editor used to edit log's text
     *
     * @param {Object} value the new editor
     */
    set textEditor(value) {
        this._textEditor = value;
    }
}
