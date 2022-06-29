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
 * @param {object} columnsDescriptions The full collection of API keys and their corresponding header values
 * @param {SortModel|null} sortModel The model storing the sorting state
 * @param {object|null} filterModel The model storing the filtering state
 * @return {vnode} An array of rows containing all given header values with specific cell sizes
 */
const headers = (columnsDescriptions, sortModel, filterModel) => {
    const entries = Object.entries(columnsDescriptions).filter(([_, columnDescription]) => columnDescription.visible);
    const isInlineFilter = entries.some(([_, value]) => value.inlineFilter);

    return h('thead', h(`tr${isInlineFilter ? '.va-top' : ''}`, entries.map(([key, value]) => {
        const classes = [value.size || null, value.classes || null];
        const attributes = {
            scope: 'col',
            title: value.name.toLocaleUpperCase(),
        };
        let content = [value.name];

        if (sortModel && value.sortable) {
            attributes.onmouseenter = () => {
                sortModel.setPreviewOn(key);
            };
            attributes.onmouseleave = () => {
                sortModel.unsetPreviewOn(key);
            };
            const preview = sortModel.isPreviewOn(key);

            let icon;
            const icons = {
                asc: iconCaretBottom(),
                desc: iconCaretTop(),
            };

            if (preview) {
                icon = icons[sortModel.getPreviewDirection(key)] || iconX();
            } else {
                icon = icons[sortModel.getAppliedDirection(key)] || null;
            }

            classes.push('clickable');
            attributes.onclick = () => sortModel.cycleDirection(key);

            const sortIndicator = h(
                `.ml2${preview ? '.gray-dark' : ''}`,
                { id: `${key}-sort${preview ? '-preview' : ''}` },
                icon,
            );
            content.push(sortIndicator);

            // Wrap content in a row container
            content = h('.flex-row.items-center', content);
        } else if (value.inlineFilter) {
            const {
                getValue = null,
                onChange = () => {
                    // Simple default which does nothing
                },
                placeholder = '',
            } = value.inlineFilter;
            content.push(h('input.form-control', {
                type: 'text',
                placeholder,
                oninput: (e) => onChange(e.target.value, filterModel),
                ...getValue ? { value: getValue(filterModel) } : {},
            }));

            // Wrap content in a column container
            content = h('.flex-column.justify-between.gr2', content);
        }

        return h(`th#${key}.${classes.filter((item) => Boolean(item)).join(' ')}`, attributes, content);
    })));
};

export default headers;
