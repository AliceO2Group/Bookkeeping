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
const o2endFilter = (model) => {
    const date = new Date();
    const o2from = model.runs.getO2endFilterFrom();
    const o2to = model.runs.getO2endFilterTo();
    const o2fromTime = model.runs.getO2endFilterFromTime();
    const o2toTime = model.runs.getO2endFilterToTime();
    const now = `${date.getHours()}:${(date.getMinutes() < 10 ? '0' : '') + date.getMinutes()}`;
    return h('', [
        h('.f6', 'Ended from:'),
        h('input.w-50.mv1', {
            type: 'date',
            id: 'o2endFilterFrom',
            placeholder: DATE_FORMAT,
            max: o2to || today,
            value: o2from,
            onchange: (e) => model.runs.setO2endFilter('From', e.target.value, e.target.validity.valid),
            oninput: (e) => model.runs.setO2endFilterWithDebounce('From', e.target.value, e.target.validity.valid),
        }, ''),
        h('input.w-50.mv1', {
            type: 'time',
            id: 'o2endFilterFromTime',
            max: today == o2from ?
                now :
                o2from == o2to ? o2toTime : '23:59',
            value: o2fromTime,
            oninput: (e) => {
                const time = e.target.value ? e.target.value : '00:00';
                if (!o2from) {
                    model.runs.setO2endFilter('From', today, true);
                    model.runs.setO2endFilterWithDebounce('FromTime', time, e.target.value <= now);
                } else {
                    model.runs.setO2endFilterWithDebounce('FromTime', time, e.target.validity.valid);
                }
            },
        }, ''),
        h('.f6', 'Ended Till:'),
        h('input.w-50.mv1', {
            type: 'date',
            id: 'o2endFilterTo',
            min: o2from,
            max: today,
            value: o2to,
            onchange: (e) => model.runs.setO2endFilter('To', e.target.value, e.target.validity.valid),
            oninput: (e) => model.runs.setO2endFilterWithDebounce('To', e.target.value, e.target.validity.valid),
        }, ''),

        h('input.w-50.mv1', {
            type: 'time',
            id: 'o2endFilterToTime',
            min: o2from == o2to ? o2fromTime : '00:01',
            max: '23:59',
            value: o2toTime,
            oninput: (e) => {
                const time = e.target.value ? e.target.value :
                    today == o2from ? now : '23:59';
                if (!o2to) {
                    model.runs.setO2endFilter('To', today, true);
                }
                model.runs.setO2endFilterWithDebounce('ToTime', time, e.target.validity.valid);
            },
        }, ''),
    ]);
};

export default o2endFilter;
