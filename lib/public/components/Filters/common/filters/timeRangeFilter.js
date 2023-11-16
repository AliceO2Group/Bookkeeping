/**
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
import { dropdown } from '../../../common/popover/dropdown.js';
import { h } from '/js/src/index.js';
import { dateTimeInput } from '../../../common/form/inputs/dateTimeInput.js';
import { getLocaleDateAndTime } from '../../../../utilities/dateUtils.js';

/**
 * Format the current timestamp range display
 *
 * @param {Partial<Period>} the current period
 * @return {Component} the resulting component
 */
const formatTimeRange = ({ from, to }) => {
    let parts = [];

    // eslint-disable-next-line require-jsdoc
    const formatTimestamp = (timestamp) => {
        const { date, time } = getLocaleDateAndTime(timestamp);
        return h('.flex-column.g1', [h('.f6', date), h('', time)]);
    };

    // eslint-disable-next-line require-jsdoc
    const label = (content) => h('.gray-darker', content);

    if (from === undefined && to === undefined) {
        parts = '-';
    } else if (from === undefined) {
        parts = [label('Before'), formatTimestamp(to)];
    } else if (to === undefined) {
        parts = [label('After'), formatTimestamp(from)];
    } else {
        parts = [label('From'), formatTimestamp(from), label('to'), formatTimestamp(to)];
    }

    return h('.flex-row.items-center.text-center.g3', parts);
};

/**
 * Return a time range filter component
 *
 * @param {TimeRangeFilterModel} timeRangeFilterModel the model of the filter
 * @return {Component} the resulting component
 */
export const timeRangeFilter = (timeRangeFilterModel) => dropdown(
    h(
        `.dropdown-trigger.form-control${timeRangeFilterModel.isValid ? '' : '.invalid'}`,
        [
            h('.flex-grow', formatTimeRange(timeRangeFilterModel.normalized)),
            h('.dropdown-trigger-symbol', ''),
        ],
    ),
    h('.flex-row.time-range-selector', [
        h('.flex-column.g3.p3', [
            h('.flex-column.g1', [
                h('label.flex-row.g2', [h('', 'From'), h('.gray-darker', '(Included)')]),
                dateTimeInput(timeRangeFilterModel.fromTimeInputModel),
            ]),
            h('.flex-column.g1', [
                h('label.flex-row.g2', [h('', 'To'), h('.gray-darker', '(Excluded)')]),
                dateTimeInput(timeRangeFilterModel.toTimeInputModel),
            ]),
        ]),
    ]),
);
