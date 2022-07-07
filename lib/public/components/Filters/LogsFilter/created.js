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

const DATE_FORMAT = 'YYYY-MM-DD';

let today = new Date();
today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
[today] = today.toISOString().split('T');

/**
 * Returns the creation date filter components
 * @param {Object} model The global model object
 * @return {vnode} Two date selection boxes to control the minimum and maximum creation dates for the log filters
 */
const createdFilter = (model) => {
    const createdFrom = model.logs.getCreatedFilterFrom();
    const createdTo = model.logs.getCreatedFilterTo();
    return h('', [
        h('.f6', 'From:'),
        h('input.w-75.mv1', {
            type: 'date',
            id: 'createdFilterFrom',
            placeholder: DATE_FORMAT,
            max: createdTo || today,
            value: createdFrom,
            oninput: (e) => model.logs.setCreatedFilter('From', e.target.value, e.target.validity.valid),
        }, ''),
        h('.f6', 'To:'),
        h('input.w-75.mv1', {
            type: 'date',
            id: 'createdFilterTo',
            placeholder: DATE_FORMAT,
            min: createdFrom,
            max: today,
            value: createdTo,
            oninput: (e) => model.logs.setCreatedFilter('To', e.target.value, e.target.validity.valid),
        }, ''),
    ]);
};

export default createdFilter;
