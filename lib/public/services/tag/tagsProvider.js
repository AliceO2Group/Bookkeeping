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

import { getRemoteData } from '../../utilities/fetch/getRemoteData.js';
import { RemoteDataProvider } from '../RemoteDataProvider.js';

/**
 * Service class to fetch tags from the backend
 */
export class TagsProvider extends RemoteDataProvider {
    /**
     * Constructor
     */
    constructor() {
        super();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    getRemoteData() {
        return getRemoteData('/api/tags').then(({ data }) => data);
    }

    /**
     * Returns the list of all the available tags
     *
     * @return {Promise<Tag[]>} the list of all available tags
     */
    async getAll() {
        return this.getItems();
    }

    /**
     * Returns the list of all available tags that have not been archived yet
     *
     * @return {Promise<Tag[]>} the list of not archived tags
     */
    async getNotArchived() {
        const tags = await this.getItems();
        return tags.filter(({ archived }) => !archived);
    }
}

export const tagsProvider = new TagsProvider();
