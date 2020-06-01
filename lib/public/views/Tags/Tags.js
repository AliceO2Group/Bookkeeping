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
import { Observable, RemoteData, fetchClient } from '/js/src/index.js';

/**
 * Tag model
 */
class TagModel extends Observable {
    /**
     * Creates a new `Tag Model` instance.
     *
     * @param {*} model Pass the model to access the defined functions.
     * @returns {undefined}
     */
    constructor(model) {
        super();
        this.model = model;

        // Overview
        this.clearTags();
    }

    /**
     * Returns the Tags data.
     *
     * @returns {RemoteData} The Tags data.
     */
    getTags() {
        return this.tags;
    }

    /**
     * Fetches all Tags.
     *
     * @returns {undefined}
     */
    async fetchAllTags() {
        if (this.getTags().isSuccess()) {
            // We already have this panel
            return;
        }

        this.tags = RemoteData.loading();
        this.notify();

        const response = await fetchClient('/api/tags');
        const result = await response.json();

        if (result.data) {
            this.tags = RemoteData.success(result.data);
        } else {
            this.tags = RemoteData.failure(result.errors);
        }

        this.notify();
    }

    /**
     * Sets all data related to the Tags to `NotAsked`.
     *
     * @returns {undefined}
     */
    clearTags() {
        this.tags = RemoteData.NotAsked();
    }
}

export default TagModel;
