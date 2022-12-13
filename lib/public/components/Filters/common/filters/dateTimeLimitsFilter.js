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
import { formatDateForHTMLInput } from '../../../../utilities/formatting/formatDateForHTMLInput.js';

const DATE_FORMAT = 'YYYY-MM-DD';

/**
 * Returns a component providing a from/to filter
 *
 * @param {DateTimeLimitsFilterModel} filterModel the model of the filter
 *
 * @return {vnode} the filter component
 */
export const dateTimeLimitsFilter = (filterModel) => {
    const now = new Date();

    const { date: currentDay, time: currentTime } = formatDateForHTMLInput(now);
    let maxFromDate; let maxFromTime; let minTillDate; let minTillTime;
    const maxTillDate = currentDay;
    const maxTillTime = currentTime;

    if (filterModel.tillTimestamp) {
        ({ date: maxFromDate, time: maxFromTime } = formatDateForHTMLInput(new Date(filterModel.tillTimestamp)));
    } else {
        maxFromDate = currentDay;
        maxFromTime = currentTime;
    }

    if (filterModel.fromTimestamp) {
        ({ date: minTillDate, time: minTillTime } = formatDateForHTMLInput(new Date(filterModel.fromTimestamp)));
    }

    const { fromDate, fromTime, tillDate, tillTime } = filterModel.raw;

    return h('', [
        h('.f6', 'Started From:'),
        h('input.w-50.mv1.datetime-filter-date.datetime-filter-from-date', {
            type: 'date',
            placeholder: DATE_FORMAT,
            max: maxFromDate,
            value: fromDate,
            oninput: (e) => filterModel.update({ fromDate: e.target.value }, e.target.validity.valid),
        }, ''),
        h('input.w-50.mv1.datetime-filter-time.datetime-filter-from-time', {
            type: 'time',
            max: maxFromTime,
            value: fromTime,
            oninput: (e) => {
                const time = e.target.value;
                if (time !== '' && !fromDate) {
                    filterModel.update(
                        {
                            fromDate: currentDay,
                            fromTime: time,
                        },
                        e.target.validity.valid && e.target.value <= currentTime,
                    );
                } else {
                    filterModel.update(
                        { fromTime: time },
                        e.target.validity.valid,
                    );
                }
            },
        }, ''),
        h('.f6', 'Started Till:'),
        h('input.w-50.mv1.datetime-filter-date.datetime-filter-till-date', {
            type: 'date',
            placeholder: DATE_FORMAT,
            min: minTillDate,
            max: maxTillDate,
            value: tillDate,
            oninput: (e) => filterModel.update({
                tillDate: e.target.value,
            }, e.target.validity.valid),
        }, ''),
        h('input.w-50.mv1.datetime-filter-time.datetime-filter-till-time', {
            type: 'time',
            min: minTillTime,
            max: maxTillTime,
            value: tillTime,
            oninput: (e) => {
                const time = e.target.value;
                if (time !== '' && !tillDate) {
                    filterModel.update(
                        {
                            tillDate: currentDay,
                            tillTime: time,
                        },
                        e.target.validity.valid && e.target.value <= currentTime,
                    );
                } else {
                    filterModel.update(
                        { tillTime: time },
                        e.target.validity.valid,
                    );
                }
            },
        }, ''),
    ]);
};
