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
import { h, info } from '/js/src/index.js';
import { profiles } from '../../common/table/profiles.js';
import { applyProfile } from '../../../utilities/applyProfile.js';
import { tooltip } from '../../common/popover/tooltip.js';

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
 * @param {object} [configuration] additional configuration
 * @param {string} [configuration.profile = profiles.none] profile which filters should be rendered @see Column
 * @return {Component} the filters panel
 */
const filtersToggleContent = (
    filteringModel,
    columns,
    { profile: appliedProfile = profiles.none } = {},
) => h('.w-l.scroll-y.flex-column.p3.g3', [
    h('.flex-row.justify-between', [
        h('.f4', 'Filters'),
        h(
            'button#reset-filters.btn.btn-danger',
            {
                onclick: () => filteringModel.reset(),
                disabled: !filteringModel.isAnyFilterActive(),
            },
            'Reset all filters',
        ),
    ]),
    h('.flex-column.g2', [
        Object.entries(columns)
            .filter(([_, column]) => {
                let columnProfiles = column.profiles ?? [profiles.none];
                if (typeof columnProfiles === 'string') {
                    columnProfiles = [columnProfiles];
                }
                return applyProfile(column, appliedProfile, columnProfiles)?.filter;
            })
            .map(([columnKey, { name, filterTooltip, filter }]) => [
                h(`.flex-row.items-baseline.${columnKey}-filter`, [
                    h('.w-30.f5.flex-row.items-center.g2', [
                        name,
                        filterTooltip ? tooltip(info(), filterTooltip) : null,
                    ]),
                    h('.w-70', typeof filter === 'function' ? filter(filteringModel) : filter),
                ]),
            ]),
    ]),
]);

/**
 * Return component composed of the filtering popover and its button trigger
 *
 * @param {object} filterModel the filter model
 * @param {object} activeColumns the list of active columns containing the filtering configuration
 * @param {object} [configuration] optional configuration
 * @param {string} [configuration.profile] specify for which profile filtering should be enabled
 * @return {Component} the filter component
 */
export const filtersPanelPopover = (filterModel, activeColumns, configuration) => popover(
    filtersToggleTrigger(),
    filtersToggleContent(filterModel, activeColumns, configuration),
    {
        ...PopoverTriggerPreConfiguration.click,
        anchor: PopoverAnchors.RIGHT_START,
        // Set children size to true because filter panel has an overflow scroll
        setChildrenSize: true,
    },
);
