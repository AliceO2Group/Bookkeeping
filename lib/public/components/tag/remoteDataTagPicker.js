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

import spinner from '../common/spinner.js';
import { picker } from '../common/selection/picker/picker.js';
import { h } from '/js/src/index.js';
import { tagToOption } from './tagToOption.js';
import { frontLink } from '../common/navigation/frontLink.js';

const NO_TAG_TEXT = 'No tags defined, please go here to create them.';

/**
 * Return a component representing a picker for a remote data list of tags, handling each possible remote data status
 *
 * @param {RemoteData} tagsRemoteData the remote data tags list
 * @param {PickerModel} tagPickerModel the model storing the tag picker's state
 * @param {PickerConfiguration} [configuration] the remote data tag picker's configuration
 *
 * @return {vnode|vnode[]|null} the resulting component
 */
export const remoteDataTagPicker = (tagsRemoteData, tagPickerModel, configuration) => tagsRemoteData.match({
    NotAsked: () => null,
    Loading: () => spinner({
        size: 2,
        justify: 'left',
        absolute: false,
    }),
    Success: (tags) => tags.length > 0
        ? picker(
            tags.map(tagToOption),
            tagPickerModel,
            {
                selector: 'tag',
                placeHolder: h(
                    'label.form-check-label.f6',
                    { for: 'tags' },
                    [
                        'New tags can be created at the ',
                        frontLink('Create Tag', 'tag-create', {}, { id: 'tagCreateLink' }),
                        ' screen.',
                    ],
                ),
                ...configuration,
            },
        )
        : frontLink(NO_TAG_TEXT, 'tag-create', {}, { id: 'tagCreateLink' }),
    Failure: () => null,
});
