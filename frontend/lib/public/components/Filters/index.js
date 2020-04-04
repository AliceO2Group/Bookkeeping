/**
 * This file is part of the ALICE Electronic Logbook v2, also known as Jiskefet.
 * Copyright (C) 2020  Stichting Hogeschool van Amsterdam
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { h } from '/js/src/index.js';

const FILTERS_LIMITS = 5;

/**
 * Checkbox filter
 * @param {Object} model
 * @param {Array} tags
 * @return {vnode}
 */
const checkboxFilter = (model, tags) => {
    const checkboxes = Object.entries(tags).map(([tag, count], index) =>
        h('.form-check', [
            h('input.form-check-input', {
                onclick: (e) => {
                    const isChecked = e.target.checked;
                    !isChecked
                        ? model.overview.removeFilter(tag)
                        : model.overview.addFilter(tag);
                },
                id: `filtersCheckbox${index + 1}`,
                type: 'checkbox',
            }),
            h('label.flex-row.items-center.form-check-label', {
                for: `filtersCheckbox${index + 1}`,
            }, tag, h('.f7.mh1.gray-darker', `(${count})`)),
        ]));

    return checkboxes.length > FILTERS_LIMITS
        ? h('.form-group', [
            ...checkboxes.slice(0, FILTERS_LIMITS),
            h('button.btn.btn-primary.mv1', {
                onclick: () => console.log('TODO'),
            }, 'Meer opties'),
            ...checkboxes.slice(FILTERS_LIMITS),
        ])
        : h('.form-group', checkboxes);
};

/**
 * Render the filters
 * @param {Object} model
 * @param {Array} tags
 * @return {vnode}
 */
const filters = (model, tags) =>
    h('.w-25.shadow-level1.p2', [
        h('.f3', 'Filters'),
        h('.f4', 'Tags'),
        checkboxFilter(model, tags),
    ]);

export default filters;
