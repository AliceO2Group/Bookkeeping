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
import { PickerModel } from '../common/selection/picker/PickerModel.js';
import { tagsProvider } from '../../services/tag/tagsProvider.js';
import { tagToOption } from './tagToOption.js';
import { RemoteData } from '/js/src/index.js';

/**
 * @typedef TagPickerModelExclusiveConfiguration
 * @property {boolean} [includeArchived=false]
 * @typedef {PickerModelConfiguration & TagPickerModelExclusiveConfiguration} TagPickerModelConfiguration
 */

/**
 * Stores the state of a tag picker
 */
export class TagPickerModel extends PickerModel {
    /**
     * Constructor
     * @param {TagPickerModelConfiguration} [configuration={}] the picker's configuration
     */
    constructor(configuration) {
        super({ ...configuration || {}, availableOptions: RemoteData.notAsked() });
        const { includeArchived = false } = configuration || {};
        (includeArchived ? tagsProvider.getAll() : tagsProvider.getNotArchived()).then(
            (tags) => {
                this.availableOptions = RemoteData.success(tags.map(tagToOption));
            },
            (errors) => {
                this.availableOptions = RemoteData.failure(errors);
            },
        );
    }
}
