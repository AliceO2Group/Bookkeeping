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
import { iconCaretTop, iconCaretBottom, iconX, info } from '/js/src/icons.js';
import { popover } from '../popover/popover.js';

/**
 * @typedef TableModels the list of models that handle an eventual table state
 * @property {Object} [sort] the model storing the sorting state of the table
 * @property {Object} [filter] the model storing the filtering state of the table
 */

/**
 * Renders the header row
 *
 * @param {Column[]} columns the list of columns definitions for which headers need to be displayed
 * @param {TableModels|null} [models] the models that handle the table state
 * @return {vnode} An array of rows containing all given header values with specific cell sizes
 */
export const headers = (columns, models) => {
    const isInlineFilter = columns.some(({ inlineFilter }) => inlineFilter);
    const { sort: sortModel = null, filter: filterModel = null } = models || {};

    return h('thead', h(`tr${isInlineFilter ? '.va-top' : ''}`, columns.map((column) => {
        const { size, name, sortable, key, inlineFilter } = column;
        const classes = [size || null, column.classes || null];

        // Name needs to be empty for a popover, otherwise the name when hovering will be blocking the popover.
        const attributes = {
            scope: 'col',
            title: column.information ? '' : name.toLocaleUpperCase(),
        };
        let content = [name];
        if (sortModel && sortable) {
            attributes.onmouseenter = () => {
                sortModel.previewOn = key;
            };
            attributes.onmouseleave = () => {
                sortModel.unsetPreviewOn(key);
            };
            attributes.onclick = () => sortModel.cycleDirection(key);

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

            const sortIndicator = h(
                `.ml2${preview ? '.gray-dark' : ''}`,
                { id: `${key}-sort${preview ? '-preview' : ''}` },
                icon,
            );
            content.push(sortIndicator);

            // Wrap content in a row container
            content = h('.flex-row.items-center', content);
        } else if (inlineFilter) {
            const {
                getValue = null,
                onChange = () => {
                    // Simple default which does nothing
                },
                placeholder = '',
            } = inlineFilter;
            content.push(h('input.form-control', {
                type: 'text',
                placeholder,
                oninput: (e) => onChange(e.target.value, filterModel),
                ...getValue ? { value: getValue(filterModel) } : {},
            }));

            // Wrap content in a column container
            content = h('.flex-column.justify-between.gr2', content);
        }
        if (column.information) {
            content.push(popover(h('.ph2', info()), column.information));
            content = h('.flex-row.items-center', content);
        }

        return h(`th#${key}.${classes.filter((item) => Boolean(item)).join(' ')}`, attributes, content);
    })));
};
