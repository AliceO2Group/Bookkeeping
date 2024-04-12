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
import { h } from '/js/src/index.js';
import { DateTimeInputComponent } from '../../../common/form/inputs/DateTimeInputComponent.js';

/**
 * @typedef TimeInputConfiguration
 * @property {string|Componenet|null} label label for input, if null default label is rendered
 */

/**
 * @typedef TimeRangeInputComponentOptions
 * @property {boolean} [seconds=false] states if the input has granularity up to seconds (if not, granularity is minutes)
 * @property {number} min minimal timestamp accepted by both inputs
 * @property {number} max maximal timestamp accepted by both inputs
 * @property  {TimeInputConfiguration} fromInputConfiguration `from` input additioal configuration
 * @property  {TimeInputConfiguration} toInputConfiguration `to` input additional configuration
 */

/**
 * Return a time range input component
 *
 * @param {TimeRangeInputModel} timeRangeInputModel the model of the time range input
 * @param {TimeRangeInputComponentOptions} options inputs options
 * @return {Component} time range input component
 */
export const timeRangeInput = (timeRangeInputModel, { seconds, min, max, fromInputConfiguration, toInputConfiguration } = {}) => {
    const { label: fromLabel = h('', 'From') } = fromInputConfiguration || {};
    const { label: toLabel = h('', 'To') } = toInputConfiguration || {};

    const { value: fromValue } = timeRangeInputModel.fromTimeInputModel;
    const { value: toValue } = timeRangeInputModel.toTimeInputModel;

    const fromMax = max
        ? toValue ? Math.min(toValue, max) : max
        : toValue;

    const toMin = min
        ? fromValue ? Math.max(fromValue, min) : min
        : fromValue;

    const timeStep = seconds ? 1000 : 60 * 1000;
    return h('.flex-column.g3.p3', [
        h('.flex-column.g1', [
            h('label.flex-row.g2', fromLabel),
            h(DateTimeInputComponent, {
                value: timeRangeInputModel.fromTimeInputModel.raw,
                onChange: (value) => timeRangeInputModel.fromTimeInputModel.update(value),
                required: timeRangeInputModel.isRequired(),
                seconds,
                min,
                max: fromMax ? fromMax - timeStep : null,
            }),
        ]),
        h('.flex-column.g1', [
            h('label.flex-row.g2', toLabel),
            h(DateTimeInputComponent, {
                value: timeRangeInputModel.toTimeInputModel.raw,
                onChange: (value) => timeRangeInputModel.toTimeInputModel.update(value),
                required: timeRangeInputModel.isRequired(),
                seconds,
                min: toMin ? toMin + timeStep : null,
                max,
            }),
        ]),
    ]);
};
