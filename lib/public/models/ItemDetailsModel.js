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
import { ObservableData } from '../utilities/ObservableData.js';
import { jsonFetch } from '../utilities/fetch/jsonFetch.js';
import { jsonPut } from '../utilities/fetch/jsonPut.js';
import { Observable, RemoteData } from '/js/src/index.js';

/**
 * Base model representing the state of the update of an item
 */
export class ItemDetailsModel extends Observable {
    /**
     * Constructor
     * @param {string} apiEndpoint the api endpoint to call to submit the update form data
     */
    constructor(apiEndpoint) {
        super();

        this._apiEndpoint = apiEndpoint;

        this._updateResult = new ObservableData(RemoteData.notAsked());
        this._updateResult.bubbleTo(this);

        this._itemId = null;
        this._item = new ObservableData(RemoteData.notAsked());
        this._item.bubbleTo(this);

        this._isEditModeEnabled = false;

        this.resetPatch();
    }

    /**
     * Sets all data related to the Tag update screen to a default value.
     *
     * @param {boolean} notify if true, notify observers after reset
     * @returns {void}
     */
    reset() {
        this.resetPatch();
        this._updateResult.setCurrent(RemoteData.notAsked());
    }

    /**
     * Fetch item with given id from given endpoint
     * @returns {void}
     */
    async loadItem() {
        this._item.setCurrent(RemoteData.loading());
        try {
            const { data } = await jsonFetch(this.getItemEndpoint());
            this._item.setCurrent(RemoteData.success(data));
        } catch (errors) {
            this._item.setCurrent(RemoteData.failure(errors));
        }
    }

    /**
     * Return endpoint to fetch/update item with given id
     * @return {string} endpoint for given item
     */
    getItemEndpoint() {
        return `${this._apiEndpoint}/${this._itemId}`;
    }

    /**
     * Submit the current form data, handling errors appropriately
     * @returns {void}
     */
    async submitPatch() {
        this._updateResult.setCurrent(RemoteData.loading());
        try {
            const { data } = await jsonPut(this.getItemEndpoint(), this._getSerializablePatch());
            this._updateResult.setCurrent(RemoteData.success(data));
            if (data) {
                this._item.setCurrent(RemoteData.success(data));
            }
        } catch (errors) {
            this._updateResult.setCurrent(RemoteData.failure(errors));
        }
    }

    /**
     * Set id of current item
     * @param {number} itemId id of item
     */
    set itemId(itemId) {
        this._itemId = itemId;
        this.loadItem();
    }

    /**
     * Get current item
     */
    get item() {
        return this._item.getCurrent();
    }

    /**
     * States if edit mode is enabled
     */
    get isEditModeEnabled() {
        return this._isEditModeEnabled;
    }

    /**
     * Defines if edit mode is enabled
     *
     * @param {boolean} value if true, edit mode will be enabled
     */
    set isEditModeEnabled(value) {
        this._isEditModeEnabled = Boolean(value);
        this.notify();
    }

    /**
     * States if the current form patch is valid or not
     *
     * @return {boolean} true if the current patch is valid
     */
    isValid() {
        return true;
    }

    /**
     * Returns the recently created tag, if any, from the tag update screen.
     *
     * @returns {RemoteData} The recently created tag.
     */
    get updateResult() {
        return this._updateResult.getCurrent();
    }

    /**
     * Set a fresh new form patch
     *
     * @return {*} the new patch
     * @private
     */
    resetPatch() {
        throw new Error('Not implemented');
    }

    /**
     * Returns a serializable version of the current data
     *
     * @return {object} the current data
     * @private
     */
    _getSerializablePatch() {
        throw new Error('Not implemented');
    }
}
