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
 * Returns the duration filter component
 *
 * @param {DurationFilterModel} durationFilterModel the duration filter model
 * @return {Component} the duration filter
 */
export const durationFilter = (durationFilterModel) => {
    const { durationInputModel, operatorSelectionModel } = durationFilterModel;

    const { hours, minutes, seconds } = durationInputModel.raw;

    /**
     * Return oninput handler for given time unit
     *
     * @param {'hours'|'minutes'|'seconds'} unitName time unit
     * @return {function(InputEvent, void)} oninput handler for input for given time unit
     */
    const updateInputModelByTimeUnit = (unitName) => (e) => {
        const { value } = e.target;
        const parsedValue = Number(value);
        if (value.length > 0 && 0 <= parsedValue && parsedValue < 60) {
            durationInputModel.update({ [unitName]: parsedValue });
        } else {
            durationFilterModel.visualChange$.notify();
        }
    };

    const hoursInput = h('input.flex-grow', {
        id: 'hours-input',
        type: 'number',
        min: 0,
        value: hours,
        oninput: updateInputModelByTimeUnit('hours'),
    });
    const minutesInput = h('input.flex-grow', {
        id: 'minutes-input',
        type: 'number',
        min: 0,
        max: 59,
        value: minutes,
        oninput: updateInputModelByTimeUnit('minutes'),
    }, 'm');
    const secondsInput = h('input.flex-grow', {
        id: 'seconds-input',
        type: 'number',
        min: 0,
        max: 59,
        value: seconds,
        oninput: updateInputModelByTimeUnit('seconds'),
    }, 's');

    const inputs = h('.flex-row.w-100', [
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

    return comparisonOperatorFilter(
        inputs,
        operatorSelectionModel.selected[0],
        (operator) => operatorSelectionModel.select(operator),
    );
};
