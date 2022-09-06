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

import { taggedEventRegistry } from '../../../utilities/taggedEventRegistry.js';
import { FILTER_PANEL_CLICK_TAG } from '../filtersConstants.js';
import { h } from '/js/src/index.js';

/**
 * Display a panel of filters
 *
 * TODO Separate filters from active columns
 *
 * @param {Model} globalModel the global model
 * @param {object} filteringModel the filtering model
 * @param {object} columns the list of columns containing filters
 *
 * @return {vnode} the filters panel
 */
export const filtersPanel = (globalModel, filteringModel, columns) => h(
    `.w-25.filters${filteringModel.areFiltersVisible ? '.display-block' : '.display-none'}`,
    {
        onclick: (e) => taggedEventRegistry.tagEvent(e, FILTER_PANEL_CLICK_TAG),
    },
    h('.w-100.shadow-level1.br2', [
        h('.f4.ph2', 'Filters'),
        Object.values(columns).reduce((accumulator, column) => {
            if (column.filter) {
                accumulator.push([
                    h('.flex-row.items-baseline.ph3.pv1', [
                        h('.w-30.f5', column.name),
                        h('.w-70', typeof column.filter === 'function' ? column.filter(filteringModel, globalModel) : column.filter),
                    ]),
                ]);
            }
            return accumulator;
        }, []),
        h('.p2', h('button.btn.btn-danger.mt2', {
            disabled: !filteringModel.isAnyFilterActive(),
            onclick: () => filteringModel.reset(),
        }, 'Reset all filters')),
    ]),
);
