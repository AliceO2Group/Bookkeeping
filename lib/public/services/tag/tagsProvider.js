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

import { Observable } from '/js/src/index.js';
import { getRemoteData } from '../../utilities/fetch/getRemoteData.js';

/**
 * Service class to fetch tags from the backend
 */
export class TagsProvider extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._allTags = null;
    }

    /**
     * Returns the list of all the available tags
     *
     * @return {Promise<Tag[]>} the list of all available tags
     */
    async getAll() {
        if (!this._allTags) {
            this._allTags = getRemoteData('/api/tags').then(({ data }) => data);
        }

        return this._allTags;
    }

    /**
     * Returns the list of all available tags that have not been archived yet
     *
     * @return {Promise<Tag[]>} the list of not archived tags
     */
    async getNotArchived() {
        const tags = await this.getAll();
        return tags.filter(({ archived }) => !archived);
    }

    /**
     * Mark the state of the provider as being stale, data will be fetched again next time it will be fetched
     *
     * @return {void}
     */
    maskAsStale() {
        this._allTags = null;
    }
}

export const tagsProvider = new TagsProvider();
