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
const o2startFilter = (model) => {
    const date = new Date();
    const o2from = model.runs.getO2startFilterFrom();
    const o2to = model.runs.getO2startFilterTo();
    const o2fromTime = model.runs.getO2startFilterFromTime();
    const o2toTime = model.runs.getO2startFilterToTime();
    const now = `${date.getHours()}:${date.getMinutes()}`;

    return h('', [
        h('.f6', 'Started From:'),
        h('input.w-50.mv1', {
            type: 'date',
            id: 'o2startFilterFrom',
            placeholder: DATE_FORMAT,
            max: o2to || today,
            value: o2from,
            onchange: (e) => model.runs.setO2startFilter('From', e.target.value, e.target.validity.valid),
            oninput: (e) => model.runs.setO2startFilterWithDebounce('From', e.target.value, e.target.validity.valid),
        }, ''),
        h('input.w-50.mv1', {
            type: 'time',
            id: 'o2startFilterFromTime',
            max: today == o2from ?
                now :
                o2from == o2to ? o2toTime : '23:59',
            value: o2fromTime,
            oninput: (e) => {
                if (!o2from) {
                    model.runs.setO2startFilter('From', today, true);
                    model.runs.setO2startFilterWithDebounce('FromTime', e.target.value, e.target.value <= now);
                } else {
                    model.runs.setO2startFilterWithDebounce('FromTime', e.target.value, e.target.validity.valid);
                }
            },

        }, ''),
        h('.f6', 'Started Till:'),
        h('input.w-50.mv1', {
            type: 'date',
            id: 'o2startFilterTo',
            placeholder: DATE_FORMAT,
            min: o2from,
            max: today,
            value: o2to,
            onchange: (e) => model.runs.setO2startFilter('To', e.target.value, e.target.validity.valid),
            oninput: (e) => model.runs.setO2startFilterWithDebounce('To', e.target.value, e.target.validity.valid),
        }, ''),
        h('input.w-50.mv1', {
            type: 'time',
            id: 'o2startFilterToTime',
            min: o2from == o2to ? o2fromTime : '00:01',
            max: today == o2from ? now : '23:59',
            value: o2toTime,
            oninput: (e) => {
                if (!o2to) {
                    model.runs.setO2startFilter('To', today, true);
                    model.runs.setO2startFilterWithDebounce('ToTime', e.target.value, e.target.value <= now);
                } else {
                    model.runs.setO2startFilterWithDebounce('ToTime', e.target.value, e.target.validity.valid);
                }
            },
        }, ''),
    ]);
};

export default o2startFilter;
