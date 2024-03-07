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
import { DateTimeInputComponent } from '../../../common/form/inputs/dateTimeInput.js';
import {
    getLocaleDateAndTime,
    getStartOfMonth,
    getStartOfWeek,
    getStartOfYear,
    getWeeksCount,
    MONTH_NAMES,
} from '../../../../utilities/dateUtils.js';
import { formatTimeRange } from '../../../common/formatting/formatTimeRange.js';

/**
 * Amount of years to display as pre-defined options
 *
 * @type {number}
 */
const YEARS_OPTIONS_COUNT = 3;

/**
 * Time input step (1 minute, not configurable for now in the dateTimeInput)
 * @type {number}
 */
const TIME_STEP = 60 * 1000;

/**
 * Returns a pre-defined list of years period selectors
 *
 * @param {function} onChange function called with the clicked period and its label
 * @return {Component} the list of years selectors
 */
const yearsOptions = ({ onChange }) => {
    const currentYear = new Date().getFullYear();
    return h('', new Array(YEARS_OPTIONS_COUNT).fill(0).map((_, index) => {
        const year = currentYear - YEARS_OPTIONS_COUNT + index + 1;
        return h(
            '.dropdown-option.ph3.pv2',
            {
                onclick: () => onChange(
                    {
                        from: getStartOfYear(year).getTime(),
                        to: getStartOfYear(year + 1).getTime(),
                    },
                    year,
                ),
            },
            year,
        );
    }));
};

/**
 * Return a pre-defined list of months period selectors
 *
 * @param {function} onChange function called with the clicked period and its label
 * @return {Component} the list of months selectors
 */
const monthsOptions = ({ onChange }) => {
    const now = new Date();
    const currentMonthIndex = now.getUTCMonth();
    const currentYear = now.getFullYear();

    return h('.month-options', new Array(MONTH_NAMES.length).fill(0).map((_, index) => {
        const monthIndex = (index + currentMonthIndex + 1) % MONTH_NAMES.length;
        const year = monthIndex > currentMonthIndex ? currentYear - 1 : currentYear;
        let label = MONTH_NAMES[monthIndex];
        if (currentYear !== year) {
            label += ` (${year})`;
        }

        return h('.dropdown-option.month-option.ph3.pv2', {
            onclick: () => onChange(
                {
                    from: getStartOfMonth(monthIndex + 1, year).getTime(),
                    to: getStartOfMonth(monthIndex + 2, year).getTime(),
                },
                label,
            ),
        }, label);
    }));
};

/**
 * Return a time range filter component
 *
 * @param {TimeRangeFilterModel} timeRangeFilterModel the model of the filter
 * @return {Component} the resulting component
 */
export const timeRangeFilter = (timeRangeFilterModel) => {
    return dropdown(
        h(
            `.dropdown-trigger.form-control${timeRangeFilterModel.isValid ? '' : '.invalid'}`,
            [
                h('.flex-grow', formatTimeRange(
                    timeRangeFilterModel.normalized,
                    {
                        formatTimestamp: (timestamp) => {
                            const { date, time } = getLocaleDateAndTime(timestamp);
                            return h('.flex-column.g1', [h('.f6', date), h('', time)]);
                        },
                        formatText: (content) => h('.gray-darker', content),
                        formatParts: (parts) => h('.flex-row.items-center.text-center.g3', parts),
                    },
                )),
                h('.dropdown-trigger-symbol', ''),
            ],
        ),
        h('.flex-row.time-range-selector', [
            h('.flex-column.g3.p3', [
                h('.flex-column.g1', [
                    h('label.flex-row.g2', [h('', 'From'), h('.gray-darker', '(Included)')]),
                    h(DateTimeInputComponent, {
                        value: timeRangeFilterModel.fromTimeInputModel.raw,
                        onChange: (value) => timeRangeFilterModel.fromTimeInputModel.update(value),
                        defaults: { time: '00:00' },
                        required: timeRangeFilterModel.isRequired(),
                        max: timeRangeFilterModel.toTimeInputModel.value ? timeRangeFilterModel.toTimeInputModel.value - TIME_STEP : null,
                    }),
                ]),
                h('.flex-column.g1', [
                    h('label.flex-row.g2', [h('', 'To'), h('.gray-darker', '(Excluded)')]),
                    h(DateTimeInputComponent, {
                        value: timeRangeFilterModel.toTimeInputModel.raw,
                        onChange: (value) => timeRangeFilterModel.toTimeInputModel.update(value),
                        defaults: { time: '00:00' },
                        required: timeRangeFilterModel.isRequired(),
                        min: timeRangeFilterModel.fromTimeInputModel.value ? timeRangeFilterModel.fromTimeInputModel.value + TIME_STEP : null,
                    }),
                ]),
            ]),
            h(
                '.flex-column.dropdown-options.text-center',
                { style: { 'border-left': '1px solid var(--color-gray)' } },
                [
                    yearsOptions({ onChange: (period, label) => timeRangeFilterModel.setValue(period, label) }),
                    monthsOptions({ onChange: (period, label) => timeRangeFilterModel.setValue(period, label) }),
                    h(
                        '.dropdown-option.flex-row.g2.items-center.ph3.pv2',
                        [
                            'Week ',
                            h('input.form-control', {
                                type: 'number',
                                step: 1,
                                min: 1,
                                max: getWeeksCount(),
                                onchange: (e) => timeRangeFilterModel.setValue(
                                    {
                                        from: getStartOfWeek(e.target.value).getTime(),
                                        to: getStartOfWeek(parseInt(e.target.value, 10) + 1).getTime(),
                                    },
                                    `Week ${e.target.value}`,
                                ),
                            }),
                        ],
                    ),
                ],
            ),
        ]),
    );
}
