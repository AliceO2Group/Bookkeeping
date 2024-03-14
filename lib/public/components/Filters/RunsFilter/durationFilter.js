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
import { comparisonOperatorFilter } from '../common/filters/comparisonOperatorFilter.js';

/**
 * Returns the run duration filter component
 *
 * @param {DurationInputModel} durationFilterModel the runs model object
 * @return {vnode} the duration filter
 */
export const durationFilter = (durationFilterModel) => {
    const { hours, minutes, seconds } = durationFilterModel.raw;
    const inputs = [
        h('input.flex-grow', {
            id: 'hours-input',
            type: 'number',
            min: 0,
            value: hours,
            oninput: (e) => {
                const newHours = e.target.value;
                if (!isNaN(newHours)) {
                    durationFilterModel.update({ hours: Number(newHours) });
                }
            },
        }),
        h('label', { for: 'hours-input' }, 'h'),

        h('input.flex-grow', {
            id: 'minutes-input',
            type: 'number',
            min: 0,
            value: minutes,
            oninput: (e) => {
                const newMinutes = e.target.value;
                if (!isNaN(newMinutes)) {
                    durationFilterModel.update({ minutes: Number(newMinutes) });
                }
            },
        }, 'm'),
        h('label', { for: 'minutes-input' }, 'm'),

        h('input.flex-grow', {
            id: 'seconds-input',
            type: 'number',
            min: 0,
            value: seconds,
            oninput: (e) => {
                const newSeconds = e.target.value;
                if (!isNaN(newSeconds)) {
                    durationFilterModel.update({ seconds: Number(newSeconds) });
                }
            },
        }, 's'),
        h('label', { for: 'seconds-input' }, 's'),

    ];

    return comparisonOperatorFilter(inputs, durationFilterModel.operator, (operator) => durationFilterModel.operator = operator);
};
