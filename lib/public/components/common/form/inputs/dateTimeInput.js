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
import { iconX } from '/js/src/icons.js';

/**
 * Returns a component to pick a date and time
 *
 * @param {DateTimeInputModel} dateTimeInputModel the input model
 * @return {Component} the resulting component
 */
export const dateTimeInput = (dateTimeInputModel) => {
    const { inputsMin, inputsMax, inputTimeStep } = dateTimeInputModel;

    return h('.flex-row.items-center.g2', [
        h(
            'input.form-control',
            {
                type: 'date',
                // Firefox shrinks the date inputs, apply a min-width to it
                style: { minWidth: '9rem' },
                required: dateTimeInputModel.isRequired,
                value: dateTimeInputModel.raw.date,
                onchange: (e) => dateTimeInputModel.update({ date: e.target.value }),
                min: inputsMin ? inputsMin.date : undefined,
                max: inputsMax ? inputsMax.date : undefined,
            },
        ),
        h(
            'input.form-control',
            {
                type: 'time',
                required: dateTimeInputModel.isRequired,
                value: dateTimeInputModel.raw.time,
                onchange: (e) => dateTimeInputModel.update({ time: e.target.value }),
                min: inputsMin ? inputsMin.time : undefined,
                max: inputsMax ? inputsMax.time : undefined,
                step: inputTimeStep,
            },
        ),
        h(
            '.btn.btn-pill.f7',
            { disabled: dateTimeInputModel.value === undefined, onclick: () => dateTimeInputModel.clear() },
            iconX(),
        ),
    ]);
};
