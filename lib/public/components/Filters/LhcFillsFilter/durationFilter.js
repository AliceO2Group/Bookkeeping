/**
 * @license
 * Copyright CERN and copyright holders of ALICE Trg. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-Trg.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { comparisonOperatorFilter } from '../common/filters/comparisonOperatorFilter.js';
import { rawTextFilter } from '../common/filters/rawTextFilter.js';

/**
 * Component to filter LHC-fills by duration
 *
 * @param {TextComparisonFilterModel} durationFilterModel durationFilterModel
 * @param {string} id id used for the operand and operator elements, becomes: `${id}-operator` OR `${id}-operand`.
 * @returns {Component} the text field
 */
export const durationFilter = (durationFilterModel, id) => {
    const amountFilter = rawTextFilter(
        durationFilterModel.operandInputModel,
        { id: `${id}-operand`, classes: ['w-100'], placeholder: 'e.g 16:14:15 (HH:MM:SS)' },
    );

    return comparisonOperatorFilter(amountFilter, durationFilterModel.operatorSelectionModel.current, (value) =>
        durationFilterModel.operatorSelectionModel.select(value), { id: `${id}-operator` });
};
