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
import { Observable } from '/js/src/index.js';
import { CreationModel } from '../../../models/CreationModel.js';

/**
 * Model class storing the tag creation state
 */
export class TagCreationModel extends CreationModel {
    /**
     * Constructor
     * @param {function} onCreationSuccess function called when the tag creation is successful, passing the created tag ID as parameter
     */
    constructor(onCreationSuccess) {
        super('/api/tags', ({ id }) => onCreationSuccess(id));
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _initOrResetData() {
        this.data = new TagCreationFormData();
        this.data.bubbleTo(this);
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _getSerializableData() {
        return this.data.toPojo();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    isValid() {
        return this.data.text.length >= 2 && this.data.text.length <= 20 && this.data.description.length <= 100;
    }
}

/**
 * Data storing the current value of a tag creation form
 */
class TagCreationFormData extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._text = '';
        this._description = '';
        this._email = '';
        this._mattermost = '';
        this._color = '';
    }

    /**
     * Returns the current state as a plain old javascript object
     *
     * @return {object} the current state
     */
    toPojo() {
        return {
            text: this._text,
            description: this._description,
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
     * Returns the tag's description
     *
     * @return {string} the tag's description
     */
    get description() {
        return this._description;
    }

    /**
     * Set the tag's description
     *
     * @param {string} description the tag's description
     */
    set description(description) {
        this._description = description;
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
     * Getter for color
     *
     * @returns {String} The text currently inserted in the tag creation screen.
     */
    get color() {
        return this._color;
    }

    /**
     * Setter for color
     *
     * @param {String} color the hexcode for the tag's color.
     * @returns {void}
     */
    set color(color) {
        this._color = color;
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
