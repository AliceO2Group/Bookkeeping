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

/**
 * Returns a text input field to filter logs by author
 *
 * @param {AuthorFilterModel} authorFilterModel The author filter model object
 * @returns {Component} A text box that allows the user to enter an author substring to match against all logs
 */
export const AuthorFilterTextInput = (authorFilterModel) => h('input.w-40.mr2', {
    type: 'text',
    id: 'authorFilterText',
    value: authorFilterModel.raw,
    oninput: (e) => authorFilterModel.update(e.target.value),
});
