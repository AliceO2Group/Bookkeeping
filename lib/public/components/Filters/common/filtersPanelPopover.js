/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */
import { popover } from '../../common/popover/popover.js';
import { PopoverTriggerPreConfiguration } from '../../common/popover/popoverPreConfigurations.js';
import { PopoverAnchors } from '../../common/popover/PopoverEngine.js';
import { h } from '/js/src/index.js';

/**
 * Return the filters panel popover trigger
 *
 * @return {Component} the button component
 */
const filtersToggleTrigger = () => h('button#openFilterToggle.btn.btn.btn-primary', 'Filters');

/**
 * Return the filters panel popover content (i.e. the actual filters)
 *
 * TODO Separate filters from active columns
 *
 * @param {object} filteringModel the filtering model
 * @param {object} columns the list of columns containing filters
 *
 * @return {Component} the filters panel
 */
const filtersToggleContent = (filteringModel, columns) => h('.w-l.h-100.scroll-y', [
    h('.f4.ph3.pv2', 'Filters'),
    Object.entries(columns)
        .filter(([_, column]) => column.filter)
        .map(([columnKey, column]) => [
            h(`.flex-row.items-baseline.ph3.pv1.${columnKey}-filter`, [
                h('.w-30.f5', column.name),
                h('.w-70', typeof column.filter === 'function' ? column.filter(filteringModel) : column.filter),
            ]),
        ]),
    h('.p2', h('button#reset-filters.btn.btn-danger.mt2', {
        disabled: !filteringModel.isAnyFilterActive(),
        onclick: () => filteringModel.reset(),
    }, 'Reset all filters')),
]);

/**
 * Return component composed by the filtering popover and its button trigger
 *
 * @param {object} filterModel the filter model
 * @param {object} activeColumns the list of active columns containing the filtering configuration
 * @return {Component} the filter component
 */
export const filtersPanelPopover = (filterModel, activeColumns) => h('.flex-row.flex-grow.items-start', [
    popover(
        filtersToggleTrigger(),
        filtersToggleContent(filterModel, activeColumns),
        {
            ...PopoverTriggerPreConfiguration.click,
            anchor: PopoverAnchors.RIGHT_START,
        },
    ),
]);
