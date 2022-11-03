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

import { h } from '/js/src/index.js';
import { picker } from '../../../common/selection/picker/picker.js';
import { tagToOption } from '../../../tag/tagToOption.js';
import { combinationOperatorChoiceComponent } from '../combinationOperatorChoiceComponent.js';

/**
 * Returns a filter component to apply filtering on a defined list of tags
 *
 * @param {Object[]} tags the list of available tags
 * @param {TagFilterModel} filter the model storing the filter's state
 *
 * @return {vnode|vnode[]} the filter component
 */
export const tagFilter = (tags, filter) => {
    const visibleCheckboxes = picker(
        tags.map(tagToOption),
        filter.pickerModel,
        { selector: 'tag' },
    );

    if (visibleCheckboxes.length === 0) {
        return h('p', 'No tags.');
    }

    return [
        combinationOperatorChoiceComponent(filter.combinationOperatorModel, { selectorPrefix: 'tag-filter' }),
        ...visibleCheckboxes,
    ];
};
