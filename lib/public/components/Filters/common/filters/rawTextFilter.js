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
 * Raw text filter component
 *
 * @param {RawTextFilterModel} filterModel the filter model
 * @param {object} [configuration] filter configuration
 * @param {string[]} [configuration.classes] classes to apply to the filter input
 * @param {string} [configuration.placeholder] placeholder of the filter input
 * @return {Component} the filter
 */
export const rawTextFilter = (filterModel, configuration) => {
    const { classes = [], placeholder = '' } = configuration || {};
    h(
        'input',
        {
            type: 'text',
            class: classes.join(' '),
            value: filterModel.value,
            placeholder: placeholder,
            oninput: (e) => filterModel.update(e.target.value),
            onchange: (e) => filterModel.update(e.target.value, true),
        },
    );
};
