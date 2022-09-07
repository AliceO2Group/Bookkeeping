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

import spinner from '../../common/spinner.js';
import { picker } from './picker.js';
import { h } from '/js/src/index.js';

const NO_TAG_TEXT = 'No tags defined, please go here to create them.';

/**
 * Return a component representing a picker for a remote data list of tags, handling each possible remote data status
 *
 * @param {RemoteData} tagsRemoteData the remote data tags list
 * @param {PickerModel} tagPickerModel the model storing the tag picker's state
 * @param {boolean} creationLink if true, a creation link will be provided on top of tags list
 *
 * @return {vnode|vnode[]|null} the resulting component
 */
export const remoteDataTagPicker = (tagsRemoteData, tagPickerModel, { creationLink = true } = {}) => tagsRemoteData.match({
    NotAsked: () => null,
    Loading: () => spinner({
        size: 2,
        justify: 'left',
        absolute: false,
    }),
    Success: (tags) => tags.length > 0
        ? [
            ...creationLink
                ? [
                    h('label.form-check-label.f6', { for: 'tags' }, [
                        'New tags can be created at the ',
                        h('a#tagCreateLink', { href: '?page=tag-create' }, 'Create Tag'),
                        ' screen.',
                    ]),
                ]
                : [],
            picker(tags, tagPickerModel),
        ]
        : h('a#tagCreateLink', { href: '?page=tag-create' }, NO_TAG_TEXT),
    Failure: () => null,
});
