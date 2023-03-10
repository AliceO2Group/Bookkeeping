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
import { frontLink } from '../common/navigation/frontLink.js';
import { asRemoteData } from '../../utilities/asRemoteData.js';

const NO_TAG_TEXT = 'No tags defined, please go here to create them.';

/**
 * Return a component representing a picker for a remote data list of tags, handling each possible remote data status
 *
 * @param {PickerModel} tagPickerModel the model storing the tag picker's state
 * @param {PickerConfiguration} [configuration] the remote data tag picker's configuration
 *
 * @return {Component} the resulting component
 */
export const tagPicker = (tagPickerModel, configuration) => asRemoteData(tagPickerModel.availableOptions).match({
    NotAsked: () => null,
    Loading: () => spinner({
        size: 2,
        justify: 'left',
        absolute: false,
    }),
    Success: (options) => {
        if (options.length > 0) {
            // Keep the already checked options, even if they are not available in the list
            for (const selected of tagPickerModel.optionsSelectedByDefault) {
                if (!options.find(({ value }) => selected.value === value)) {
                    options.push(selected);
                }
            }
            return picker(
                options,
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
            );
        } else {
            return frontLink(NO_TAG_TEXT, 'tag-create', {}, { id: 'tagCreateLink' });
        }
    },
    Failure: () => null,
});
