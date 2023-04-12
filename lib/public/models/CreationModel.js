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
import { jsonPost } from '../utilities/fetch/jsonPost.js';
import { Observable, RemoteData } from '/js/src/index.js';

/**
 * Base model representing the state of the creation of an entity
 */
export class CreationModel extends Observable {
    /**
     * Constructor
     * @param {string} apiEndpoint the api endpoint to call to submit the creation form data
     * @param {function} onCreationSuccess function called when the tag creation is successful, passing the created tag ID as parameter
     */
    constructor(apiEndpoint, onCreationSuccess) {
        super();

        this._initOrResetData();
        this._creationResult = RemoteData.notAsked();

        this._apiEndpoint = apiEndpoint;
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
     * Submit the current form data, handling errors appropriately
     * @returns {void}
     */
    async submit() {
        this._creationResult = RemoteData.loading();
        this.notify();

        try {
            const { data } = await jsonPost(this._apiEndpoint, this._getSerializableData());

            this._creationResult = RemoteData.success(null);
            this._onCreationSuccess(data);
            this.reset();
        } catch (errors) {
            this._creationResult = RemoteData.failure(errors);
        }

        this.notify();
    }

    /**
     * States if the current form data is valid or not
     *
     * @return {boolean} true if the current data is valid
     */
    isValid() {
        return true;
    }

    /**
     * Returns the recently created tag, if any, from the tag creation screen.
     *
     * @returns {RemoteData} The recently created tag.
     */
    get creationResult() {
        return this._creationResult;
    }

    /**
     * Return a fresh new form data
     *
     * @return {*} the new data
     * @private
     */
    _initOrResetData() {
        throw new Error('Not implemented');
    }

    /**
     * Returns a serializable version of the current data
     *
     * @return {object} the current data
     * @private
     */
    _getSerializableData() {
        throw new Error('Not implemented');
    }
}
