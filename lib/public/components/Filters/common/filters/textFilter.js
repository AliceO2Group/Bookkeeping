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
 * Returns a text filter component
 *
 * @param {FilterInputModel} filterInputModel the model of the text filter
 * @param {Object} attributes the additional attributes to pass to the component, such as id and classes
 * @return {Component} the filter component
 */
export const textFilter = (filterInputModel, attributes) => h('input', {
    ...attributes,
    type: 'text',
    value: filterInputModel.raw,
    oninput: (e) => filterInputModel.update(e.target.value),
}, '');
