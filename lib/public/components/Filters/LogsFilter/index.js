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
import { iconChevronBottom, iconChevronRight } from '/js/src/icons.js';

/**
 * Render the individual filters within the main filter
 * @param {Object} model The global model object
 * @param {Object} columns The columns representing the table
 * @return {Object} The full collection of filters accessible through dropdowns
 */
const showFilters = (model, columns) =>
    Object.entries(columns).reduce((accumulator, [key, column]) => {
        if (column.filter) {
            accumulator.push([
                h('.flex-row.items-center.clickable', {
                    onclick: () => model.logs.toggleFilterExpanded(key),
                    id: `${key}FilterToggle`,
                }, [
                    h('', model.logs.isFilterExpanded(key) ? iconChevronBottom() : iconChevronRight()),
                    h('.f4.ml1', column.name),
                ]),
                model.logs.isFilterExpanded(key) && column.filter,
            ]);
        }
        return accumulator;
    }, []);

/**
 * Render a complete filter collection
 * @param {Object} model The global model object
 * @param {Object} columns The columns representing the table
 * @return {vnode} The full collection of filters accessible through dropdowns
 */
const filters = (model, columns) =>
    h('.w-100.shadow-level1.p2', [
        h('.flex-row.items-center.clickable', {
            onclick: () => model.logs.toggleMainFilterExpanded,
            id: 'mainFilterToggle',
        }, [
            h('', model.logs.isMainFilterExpanded ? iconChevronRight() : iconChevronBottom()),
            h('.f3.mb1', 'Filters'),
        ]),

        Object.entries(columns).reduce((accumulator, [key, column]) => {
            if (model.logs.isMainFilterExpanded()) {
                showFilters(model, columns);
            }

            if (column.filter) {
                accumulator.push([
                    h('.flex-row.items-center.clickable', {
                        onclick: () => model.logs.toggleFilterExpanded(key),
                        id: `${key}FilterToggle`,
                    }, [
                        h('', model.logs.isFilterExpanded(key) ? iconChevronBottom() : iconChevronRight()),
                        h('.f4.ml1', column.name),
                    ]),
                    model.logs.isFilterExpanded(key) && column.filter,
                ]);
            }
            return accumulator;
        }, []),
        h('button.btn.btn-danger.mt2', {
            disabled: !model.logs.isAnyFilterActive(),
            onclick: () => model.logs.resetLogsParams(),
        }, 'Reset all filters'),
    ]);

export default filters;
