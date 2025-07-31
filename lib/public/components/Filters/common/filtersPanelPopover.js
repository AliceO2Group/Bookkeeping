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
import { h, info, popover, PopoverAnchors, PopoverTriggerPreConfiguration } from '/js/src/index.js';
import { profiles } from '../../common/table/profiles.js';
import { applyProfile } from '../../../utilities/applyProfile.js';
import { tooltip } from '../../common/popover/tooltip.js';

/**
 * @typedef FilterConfiguration
 *
 * @property {string} name
 * @property {function|Component} filter
 * @property {string|Component} filterTooltip
 * @property {object|string|string[]} profiles
 */

/**
 * @typedef FiltersConfiguration
 *
 * @type {object<string, FilterConfiguration>} mapping: filterable property -> filter configuration
 */

/**
 * Return the filters panel popover trigger
 *
 * @return {Component} the button component
 */
const filtersToggleTrigger = () => h('button#openFilterToggle.btn.btn.btn-primary', 'Filters');

/**
 * Create main header of the filters panel
 * @param {FilteringModel} filteringModel filtering model
 * @returns {Component} main panel header
 */
const filtersToggleContentHeader = (filteringModel) => h('.flex-row.justify-between', [
    h('.f4', 'Filters'),
    h(
        'button#reset-filters.btn.btn-danger',
        {
            onclick: () => filteringModel.resetFiltering
                ? filteringModel.resetFiltering()
                : filteringModel.reset(),
            disabled: !filteringModel.isAnyFilterActive(),
        },
        'Reset all filters',
    ),
]);

/**
 * Return the filters panel popover content section
 *
 * @param {FilteringModel} filteringModel the filtering model
 * @param {FiltersConfiguration} filtersConfiguration filters configuration
 * @param {object} [configuration] additional configuration
 * @param {string} [configuration.profile = profiles.none] profile which filters should be rendered @see Column
 * @return {Component} the filters section
 */
export const filtersSection = (filteringModel, filtersConfiguration, { profile: appliedProfile = profiles.none } = {}) =>
    h('.flex-column.g2', [
        Object.entries(filtersConfiguration)
            .filter(([_, column]) => {
                let columnProfiles = column.profiles ?? [profiles.none];
                if (typeof columnProfiles === 'string') {
                    columnProfiles = [columnProfiles];
                }
                return applyProfile(column, appliedProfile, columnProfiles)?.filter;
            })
            .map(([columnKey, { name, filterTooltip, filter }]) =>
                name
                    ? [
                        h(`.flex-row.items-baseline.${columnKey}-filter`, [
                            h('.w-30.f5.flex-row.items-center.g2', [
                                name,
                                filterTooltip ? tooltip(info(), filterTooltip) : null,
                            ]),
                            h('.w-70', typeof filter === 'function' ? filter(filteringModel) : filter),
                        ]),
                    ]
                    : typeof filter === 'function' ? filter(filteringModel) : filter),
    ]);

/**
 * Return the filters panel popover content (i.e. the actual filters)
 *
 * @param {FilteringModel} filteringModel the filtering model
 * @param {FiltersConfiguration} filtersConfiguration filters configuration
 * @param {object} [configuration] additional configuration
 * @param {string} [configuration.profile = profiles.none] profile which filters should be rendered @see Column
 * @return {Component} the filters panel
 */
const filtersToggleContent = (
    filteringModel,
    filtersConfiguration,
    configuration = {},
) => h('.w-l.flex-column.p3.g3', [
    filtersToggleContentHeader(filteringModel),
    filtersSection(filteringModel, filtersConfiguration, configuration),
]);

/**
 * Return component composed of the filtering popover and its button trigger
 *
 * @param {FilteringModel} filteringModel the filtering model
 * @param {FiltersConfiguration} filtersConfiguration filters configuration
 * @param {object} [configuration] optional configuration
 * @param {string} [configuration.profile] specify for which profile filtering should be enabled
 * @return {Component} the filter component
 */
export const filtersPanelPopover = (filteringModel, filtersConfiguration, configuration) => popover(
    filtersToggleTrigger(),
    filtersToggleContent(filteringModel, filtersConfiguration, configuration),
    {
        ...PopoverTriggerPreConfiguration.click,
        anchor: PopoverAnchors.RIGHT_START,
    },
);
