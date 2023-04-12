/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */
import { Observable, RemoteData } from '/js/src/index.js';
import { jsonPost } from '../../../utilities/fetch/jsonPost.js';

/**
 * Model class storing the tag creation state
 */
export class TagCreationModel extends Observable {
    /**
     * Constructor
     * @param {function} onCreationSuccess function called when the tag creation is successful, passing the created tag ID as parameter
     */
    constructor(onCreationSuccess) {
        super();

        this._initOrResetData();
        this._creationResult = RemoteData.notAsked();

        this._onCreationSuccess = onCreationSuccess;
    }

    /**
     * Sets all data related to the Tag creation screen to a default value.
     *
     * @returns {void}
     */
    reset() {
        this._creationResult = RemoteData.NotAsked();
        this._initOrResetData();
        this.notify();
    }

    /**
     * Create the log with the variables set in the model, handling errors appropriately
     * @returns {void}
     */
    async submit() {
        this._creationResult = RemoteData.loading();
        this.notify();

        try {
            const { data: { id } } = await jsonPost('/api/tags', this._getSerializableData());

            this._creationResult = RemoteData.success(null);
            this._onCreationSuccess(id);
            this.reset();
        } catch (errors) {
            this._creationResult = RemoteData.failure(errors);
        }

        this.notify();
    }

    /**
     * Returns the recently created tag, if any, from the tag creation screen.
     *
     * @returns {RemoteData} The recently created tag.
     */
    creationResult() {
        return this._creationResult;
    }

    /**
     * Return a fresh new form data
     *
     * @return {TagCreationData} the new data
     * @private
     */
    _initOrResetData() {
        this.data = new TagCreationData();
        this.data.bubbleTo(this);
    }

    /**
     * Returns a serializable version of the current data
     *
     * @return {object} the current data
     * @private
     */
    _getSerializableData() {
        return this.data.toPojo();
    }
}

/**
 * Data storing the current value of a tag creation form
 */
class TagCreationData extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._text = '';
        this._email = '';
        this._mattermost = '';
    }

    /**
     * Returns the current state as a plain old javascript object
     *
     * @return {object} the current state
     */
    toPojo() {
        return {
            text: this._text,
            email: this._email,
            mattermost: this._mattermost,
        };
    }

    /**
     * Returns the currently inserted text from the tag creation screen.
     *
     * @returns {String} The text currently inserted in the tag creation screen.
     */
    get text() {
        return this._text;
    }

    /**
     * Sets the text for the tag creation screen to a newly provided text.
     *
     * @param {String} text The newly inserted text.
     * @returns {void}
     */
    set text(text) {
        this._text = text;
        this.notify();
    }

    /**
     * Getter for email
     *
     * @returns {String} The text currently inserted in the tag creation screen.
     */
    get email() {
        return this._email;
    }

    /**
     * Setter for email
     *
     * @param {String} email The newly inserted email.
     * @returns {void}
     */
    set email(email) {
        this._email = email;
        this.notify();
    }

    /**
     * Getter for mattermost
     *
     * @returns {String} The text currently inserted in the tag creation screen.
     */
    get mattermost() {
        return this._mattermost;
    }

    /**
     * Setter for mattermost.
     *
     * @param {String} mattermost The newly inserted mattermost groups.
     * @returns {void}
     */
    set mattermost(mattermost) {
        this._mattermost = mattermost;
        this.notify();
    }
}
