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
import { pickerSelection } from '../common/selection/picker/pickerSelection.js';

/**
 * Return a component representing a picker for a remote data list of tags, handling each possible remote data status
 *
 * @param {PickerModel} tagPickerModel the model storing the tag picker's state
 *
 * @return {Component} the resulting component
 */
export const tagPicker = (tagPickerModel) => tagPickerModel.selectionModel.match({
    NotAsked: () => null,
    Loading: () => spinner({
        size: 2,
        justify: 'left',
        absolute: false,
    }),
    Success: (selectionModel) => [
        pickerSelection(
            selectionModel,
            h(
                'label.form-check-label.f6',
                { for: 'tags' },
                [
                    'New tags can be created at the ',
                    frontLink('Create Tag', 'tag-create', {}, { id: 'tagCreateLink' }),
                    ' screen.',
                ],
            ),
        ),
        h('input.form-control.tag-search-input', {
            type: 'search',
            placeHolder: '🔍 Search for tags',
            value: tagPickerModel.searchInputContent,
            oninput: (e) => {
                tagPickerModel.searchInputContent = e.target.value;
            },
        }),
        h('.scroll-y.grid.columns-2-lg.columns-3-xl.g2', picker(
            selectionModel,
            { filter: tagPickerModel.searchInputContent, selector: 'tag' },
        )),
    ],
    Failure: () => null,
});
