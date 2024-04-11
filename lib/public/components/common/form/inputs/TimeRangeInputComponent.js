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
 * @typedef TimeRangeInputComponentOptions
 * @property {boolean} [seconds=false] states if the input has granularity up to seconds (if not, granularity is minutes)
 * @property {number} min minimal timestamp accepted by `from` input
 * @property {number} max maximal timestamp accepted by `to` input
 */

/**
 * Return a time range input component
 *
 * @param {TimeRangeInputModel} timeRangeInputModel the model of the time range input
 * @param {TimeRangeInputComponentOptions} options input options
 * @return {Component} time range input component
 */
export const timeRangeInput = (timeRangeInputModel, { seconds, min, max } = {}) => {
    const timeStep = seconds ? 1000 : 60 * 1000;
    return h('.flex-column.g3.p3', [
        h('.flex-column.g1', [
            h('label.flex-row.g2', h('', 'From')),
            h(DateTimeInputComponent, {
                value: timeRangeInputModel.fromTimeInputModel.raw,
                onChange: (value) => timeRangeInputModel.fromTimeInputModel.update(value),
                required: timeRangeInputModel.isRequired(),
                seconds,
                min,
                max: timeRangeInputModel.toTimeInputModel.value ? timeRangeInputModel.toTimeInputModel.value - timeStep : null,
            }),
        ]),
        h('.flex-column.g1', [
            h('label.flex-row.g2', h('', 'To')),
            h(DateTimeInputComponent, {
                value: timeRangeInputModel.toTimeInputModel.raw,
                onChange: (value) => timeRangeInputModel.toTimeInputModel.update(value),
                required: timeRangeInputModel.isRequired(),
                seconds,
                min: timeRangeInputModel.fromTimeInputModel.value ? timeRangeInputModel.fromTimeInputModel.value + timeStep : null,
                max,
            }),
        ]),
    ]);
};
