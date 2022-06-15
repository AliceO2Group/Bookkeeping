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
import { iconCaretTop, iconCaretBottom, iconX } from '/js/src/icons.js';

/**
 * Renders the header row
 * @param {Object} keys The full collection of API keys and their corresponding header values
 * @param {Object} model The global model object
 * @return {vnode} An array of rows containing all given header values with specific cell sizes
 */
const headers = (keys, model) => {
    const entries = Object.entries(keys);
    const isInlineFilter = entries.some(([_, value]) => value.inlineFilter);

    return h('thead', h(`tr${isInlineFilter ? '.va-top' : ''}`, entries.map(([key, value]) => {
        if (value.visible) {
            const classes = [value.size || null, value.classes || null];
            const attributes = {
                scope: 'col',
                title: value.name.toLocaleUpperCase(),
            };
            let content = [value.name];

            if (value.sortable) {
                const columnSortingOperation = model.logs.getSortingOperation(key);
                const columnSortingOperationPreview = model.logs.getSortingPreviewOperation(key);

                classes.push('clickable');
                attributes.onclick = () => model.logs.setSortingValues(key);
                attributes.onmouseenter = () => model.logs.setSortingPreviewValues(key);
                attributes.onmouseleave = () => model.logs.clearSortingPreviewValues();

                const sortIndicator = h(`.ml2${columnSortingOperationPreview ? '.gray-dark' : ''}`, {
                    id: `${key}-sort${columnSortingOperationPreview ? '-preview' : ''}`,
                }, {
                    asc: iconCaretBottom(), desc: iconCaretTop(), none: iconX(),
                }[columnSortingOperationPreview || columnSortingOperation]);
                content.push(sortIndicator);

                // Wrap content in a row container
                content = h('.flex-row.items-center', content);
            } else if (value.inlineFilter) {
                const {
                    onChange = () => {
                        // Simple default which do nothing
                    },
                    placeholder = '',
                } = value.inlineFilter;
                content.push(h('input.form-control', {
                    type: 'text',
                    placeholder,
                    oninput: (e) => onChange(e.target.value, model),
                }));

                // Wrap content in a column container
                content = h('.flex-column.justify-between.gr2', content);
            }

            return h(`th#${key}.${classes.filter((item) => Boolean(item)).join(' ')}`, attributes, content);
        }
    })));
};

export default headers;
