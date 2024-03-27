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
 * @param {DurationInputModel} durationFilterModel the duration input model
 * @param {ComparisonOperatorSelectionModel} operatorSelectionModel the comparison operator selection model
 * @return {Component} the duration filter
 */
export const durationFilter = (durationFilterModel, operatorSelectionModel) => {
    const { hours, minutes, seconds } = durationFilterModel.raw;
    const { secondsMin, minutesMin } = durationFilterModel;

    const hoursInput = h('input.flex-grow', {
        id: 'hours-input',
        type: 'number',
        min: 0,
        value: hours,
        oninput: (e) => {
            const { value } = e.target;
            durationFilterModel.update({ hours: value.length === 0 ? null : Number(value) });
        },
    });
    const minutesInput = h('input.flex-grow', {
        id: 'minutes-input',
        type: 'number',
        min: minutesMin,
        max: 60,
        value: minutes,
        oninput: (e) => {
            const { value } = e.target;
            durationFilterModel.update({ minutes: value.length === 0 ? null : Number(value) });
        },
    }, 'm');
    const secondsInput = h('input.flex-grow', {
        id: 'seconds-input',
        type: 'number',
        min: secondsMin,
        max: 60,
        value: seconds,
        oninput: (e) => {
            const { value } = e.target;
            durationFilterModel.update({ seconds: value.length === 0 ? null : Number(value) });
        },
    }, 's');

    const inputs = h('.flex-row.w-40', [
        hoursInput,
        minutesInput,
        secondsInput,
        h('.flex-row.items-center.p2', [
            h('label', { for: 'hours-input' }, 'h'),
            ':',
            h('label', { for: 'minutes-input' }, 'm'),
            ':',
            h('label', { for: 'seconds-input' }, 's'),
        ]),
    ]);

    return comparisonOperatorFilter(inputs, operatorSelectionModel);
};
