/*
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

import { h, iconX } from '@aliceo2/web-ui-frontend';

/**
 * Returns a text input field that can be used to filter logs by author
 *
 * @param {AuthorFilterModel} authorFilterModel The author filter model object
 * @returns {Component} A text box that allows the user to enter an author substring to match against all logs
 */
const authorFilterTextInput = (authorFilterModel) => h('input.w-40', {
    type: 'text',
    id: 'authorFilterText',
    value: authorFilterModel.raw,
    oninput: (e) => authorFilterModel.update(e.target.value),
});

/**
 * Returns a button that can be used to reset the author filter.
 *
 * @param {AuthorFilterModel} authorFilterModel The author filter model object
 * @return {Component} A button that can be used to reset the author filter
 */
const resetAuthorFilterButton = (authorFilterModel) => h(
    '.btn.btn-pill.f7',
    { disabled: authorFilterModel.isEmpty, onclick: () => authorFilterModel.clear() },
    iconX(),
);

/**
 * Returns a button that can be used to exclude anonymous authors
 *
 * @param {AuthorFilterModel} authorFilterModel The author filter model object
 * @return {Component} A button component that can be used to exclude anonymous authors
 */
const excludeAnonymousButton = (authorFilterModel) => h(
    'input.btn.btn-primary',
    {
        type: 'button',
        value: 'No Anonymous',
        disabled: authorFilterModel.isAnonymousExcluded(),
        onclick: () => authorFilterModel.applyExcludeAnonymousFilter(),
    },
);

/**
 * Returns a authorFilter component with text input, reset button, and anonymous exclusion button.
 *
 * @param {LogModel} logModel the log model object
 * @returns {Component} the author filter component
 */
export const authorFilter = ({ authorFilter }) => h('.flex-row.items-center.g3', [
    authorFilterTextInput(authorFilter),
    resetAuthorFilterButton(authorFilter),
    excludeAnonymousButton(authorFilter),
]);
