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

import { SelectionDropdownModel } from '../common/selection/dropdown/SelectionDropdownModel.js';
import { RemoteData } from '/js/src/index.js';
import { tagsProvider } from '../../services/tag/tagsProvider.js';
import { tagToOption } from './tagToOption.js';

/**
 * Model storing state of a selection of tags picked from the list of all the existing tags
 */
export class TagSelectionDropdownModel extends SelectionDropdownModel {
    /**
     * Constructor
     * @param {{includeArchived: boolean}} [configuration={}] the dropdown configuration
     * @param {boolean} [configuration.includeArchived] if true, all tags including archived will be available as selection
     */
    constructor(configuration) {
        super({ availableOptions: RemoteData.notAsked() });
        const { includeArchived } = configuration || {};
        this._includeArchived = includeArchived;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _initialize() {
        (this._includeArchived ? tagsProvider.getAll() : tagsProvider.getNotArchived()).then(
            (tags) => {
                this.availableOptions = RemoteData.success(tags.map(tagToOption));
            },
            (errors) => {
                this.availableOptions = RemoteData.failure(errors);
            },
        );
    }
}
