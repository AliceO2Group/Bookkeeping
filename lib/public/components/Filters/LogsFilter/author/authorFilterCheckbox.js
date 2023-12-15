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
import { checkboxFilter } from '../../common/filters/checkboxFilter.js';

/**
 * Returns a checkbox to exclude logs with anonymous authors
 *
 * @param {AuthorFilterModel} authorFilterModel The author filter model object
 * @returns {Component} A checkbox that allows the user to exclude logs with anonymous authors
 */
export const AuthorFilterCheckbox = (authorFilterModel) => h('.flex-row.flex-wrap.ml1.mt1', [
    checkboxFilter(
        'excludeAnonymous',
        ['Exclude Anonymous'],
        () => authorFilterModel.excludeAnonymous,
        (e) => authorFilterModel.setExcludeAnonymous(e.target.checked),
    ),
]);
