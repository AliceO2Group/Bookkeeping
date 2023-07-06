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
import { TagsOverviewModel } from './Overview/TagsOverviewModel.js';
import { TagDetailsModel } from './Details/TagDetailsModel.js';
import { TagCreationModel } from './Create/TagCreationModel.js';
import { tagsProvider } from '../../services/tag/tagsProvider.js';

/**
 * Tag model
 */
class TagModel extends Observable {
    /**
     * Creates a new `Tag Model` instance.
     *
     * @param {Model} model Pass the model to access the defined functions.
     * @returns {undefined}
     */
    constructor(model) {
        super();
        this.model = model;

        // Global tags list
        this.tags = RemoteData.notAsked();

        // Overview
        this._overviewModel = new TagsOverviewModel(model);
        this._overviewModel.bubbleTo(this);

        /**
         * @type {TagDetailsModel}
         * @private
         */
        this._detailsModel = null;

        // Create
        this._creationModel = new TagCreationModel((tagId) => {
            tagsProvider.maskAsStale();
            this.model.router.go(`/?page=tag-detail&id=${tagId}`);
        });
        this._creationModel.bubbleTo(this);
    }

    /**
     * Load the details page for the given tag
     *
     * @param {number} tagId  the id of the tag to display
     * @param {string|null|undefined} [panelKey=null] the key of the panel to display
     * @return {void}
     */
    loadDetails(tagId, panelKey = null) {
        if (this._detailsModel === null) {
            this._detailsModel = new TagDetailsModel(tagId, panelKey);
            this._detailsModel.bubbleTo(this);
        } else {
            this._detailsModel.tagId = tagId;
            this._detailsModel.tabbedPanelModel.currentPanelKey = panelKey;
        }
    }

    /**
     * Clear the tag details page state
     *
     * @return {void}
     */
    clearDetails() {
        this._detailsModel = null;
    }

    /**
     * Returns the overview sub-model
     *
     * @return {TagsOverviewModel} the overview sub-model
     */
    get overviewModel() {
        return this._overviewModel;
    }

    /**
     * Returns the details sub-model
     *
     * @return {TagDetailsModel|null} the details sub-model
     */
    get detailsModel() {
        return this._detailsModel;
    }

    /**
     * Returns the creation sub-model
     *
     * @return {TagCreationModel} the creation sub-model
     */
    get creationModel() {
        return this._creationModel;
    }
}

export default TagModel;
