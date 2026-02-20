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
import { iconX } from '/js/src/icons.js';
import { switchInput } from '../../../common/form/switchInput.js';
import { rawTextFilter } from '../../common/filters/rawTextFilter.js';

/**
 * Returns a button that can be used to reset the author filter.
 *
 * @param {AuthorFilterModel} authorFilterModel The author filter model object
 * @return {Component} A button that can be used to reset the author filter
 */
const resetAuthorFilterButton = (authorFilterModel) => h(
    '.btn.btn-pill.f7',
    { disabled: authorFilterModel.isEmpty, onclick: () => authorFilterModel.reset() },
    iconX(),
);

/**
 * Returns a toggle that can be used to exclude anonymous authors
 *
 * @param {AuthorFilterModel} authorFilterModel The author filter model object
 * @return {Component} A button component that can be used to exclude anonymous authors
 */
export const excludeAnonymousLogAuthorToggle = (authorFilterModel) => switchInput(
    authorFilterModel.isAnonymousExcluded(),
    () => authorFilterModel.toggleAnonymousFilter(),
    { labelAfter: 'No Anonymous' },
);

/**
 * Returns a authorFilter component with text input, reset button, and anonymous exclusion button.
 *
 * @param {LogsOverviewModel} logsOverviewModel the log overview model
 * @param {FilteringModel} logsOverviewModel.filteringModel the runs overview model
 * @return {Component} the filter component
 */
export const authorFilter = ({ filteringModel }) => h('.flex-row.items-center.g3', [
    rawTextFilter(filteringModel.get('authorFilter'), {
        classes: ['w-40'],
        id: 'authorFilterText',
        value: filteringModel.get('authorFilter').raw,
    }),
    resetAuthorFilterButton(filteringModel.get('authorFilter')),
    excludeAnonymousLogAuthorToggle(filteringModel.get('authorFilter')),
]);
