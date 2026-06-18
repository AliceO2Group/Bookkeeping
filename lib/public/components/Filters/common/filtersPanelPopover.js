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
import { h, info, popover, PopoverAnchors, PopoverTriggerPreConfiguration, DropdownComponent, CopyToClipboardComponent } from '/js/src/index.js';
import { iconCaretBottom } from '/js/src/icons.js';
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
const filtersToggleTrigger = () => h('button#openFilterToggle.btn.btn.btn-primary.first-item', 'Filters');

/**
 * Button component that resets all filters upon click
 *
 * @param {FilteringModel|OverviewPageModel} filteringModel the FilteringModel
 * @returns {Component} the reset button component
 */
const resetFiltersButton = (filteringModel) => h(
    'button#reset-filters.btn.btn-danger',
    {
        disabled: !filteringModel.isAnyFilterActive(),
        onclick: () => filteringModel.resetFiltering
            ? filteringModel.resetFiltering(true, true)
            : filteringModel.reset(true, true),
    },
    'Reset all filters',
);

/**
 * Create main header of the filters panel
 * @param {FilteringModel} filteringModel filtering model
 * @returns {Component} main panel header
 */
const filtersToggleContentHeader = (filteringModel) => h('.flex-row.justify-between', [
    h('.f4', 'Filters'),
    resetFiltersButton(filteringModel),
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
 * @return {Component} the filter button component
 */
const filtersPanelButton = (filteringModel, filtersConfiguration, configuration) => popover(
    filtersToggleTrigger(),
    filtersToggleContent(filteringModel, filtersConfiguration, configuration),
    {
        ...PopoverTriggerPreConfiguration.click,
        anchor: PopoverAnchors.RIGHT_START,
    },
);

/**
 * A button component that lets the user copy the url if there are active filters.
 *
 * @param {boolean} activeFilters if false, will disable the button
 * @returns {Component} the copy button component
 */
const copyButtonOption = (activeFilters) => h(
    '',
    { style: activeFilters ? {} : { opacity: 0.5, pointerEvents: 'none' } },
    h(CopyToClipboardComponent, { value: location.href, id: 'filters' }, 'Copy Active Filters'),
);

/**
 * A button component that lets the user paste the first entry of their clipboard as a filter url.
 *
 * @param {FilteringModel|OverviewPageModel} model the FilteringModel
 * @returns {Component} the paste button component
 */
const pasteButtonOption = (model) => {
    const clipboardSupported = navigator?.clipboard && window.isSecureContext;

    // Sometimes, the overview model is passed to filterPanelPopover instead of the filteringmodel (e.g. envirionments)
    const { filteringModel = model } = model;

    return h('button.btn.btn-primary', {
        onclick: async () => {
            const url = await navigator.clipboard.readText();
            filteringModel.setFilterFromURL(true, url);
        },
        disabled: !clipboardSupported,
        id: 'paste-filters',
    }, 'Paste filters');
};

/**
 * Return component composed of the filter popover button and a dropdown trigger
 *
 * @param {FilteringModel} filteringModel the filtering model
 * @param {FiltersConfiguration} filtersConfiguration filters configuration
 * @param {object} [configuration] optional configuration
 * @param {string} [configuration.profile] specify for which profile filtering should be enabled
 * @return {Component} the filter component
 */
export const filtersPanelPopover = (filteringModel, filtersConfiguration, configuration) => {
    const hasActiveFilters = filteringModel.isAnyFilterActive();

    return h(
        '.flex-row.items-center.btn-group',
        [
            filtersPanelButton(filteringModel, filtersConfiguration, configuration),
            DropdownComponent(
                h('.btn.btn-group-item.last-item', iconCaretBottom()),
                h(
                    '.flex-column.p2.g2',
                    [
                        copyButtonOption(hasActiveFilters),
                        pasteButtonOption(filteringModel),
                        resetFiltersButton(filteringModel),
                    ],
                ),
            ),
        ],
    );
};
