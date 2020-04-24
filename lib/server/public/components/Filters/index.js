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

const FILTERS_LIMITS = 5;

/**
 * Checkbox filter
 * @param {Object} model Pass the model to access the defined functions
 * @param {Array} tags Pass the tags to load in the view
 * @return {vnode} Return the form to be shown
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
                // eslint-disable-next-line no-console
                onclick: () => console.log('TODO'),
            }, 'Meer opties'),
            ...checkboxes.slice(FILTERS_LIMITS),
        ])
        : h('.form-group', checkboxes);
};

/**
 * Render the filters
 * @param {Object} model Pass the model to access the defined functions
 * @param {Array} tags Pass the tags to load in the view
 * @return {vnode} Return final view of the filtering form
 */
const filters = (model, tags) =>
    h('.w-25.shadow-level1.p2', [
        h('.f3', 'Filters'),
        h('.f4', 'Tags'),
        checkboxFilter(model, tags),
    ]);

export default filters;
