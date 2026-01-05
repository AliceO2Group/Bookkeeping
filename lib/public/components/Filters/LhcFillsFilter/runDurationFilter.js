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
 * Component to filter LHC-fills by run duration
 *
 * @param {TextComparisonFilterModel} runDurationFilterModel runDurationFilterModel
 * @returns {Component} the text field
 */
export const runDurationFilter = (runDurationFilterModel) => {
    const amountFilter = rawTextFilter(
        runDurationFilterModel.operandInputModel,
        { classes: ['w-100', 'run-duration-filter'], placeholder: 'e.g 16:14:15 (HH:MM:SS)' },
    );

    return comparisonOperatorFilter(amountFilter, runDurationFilterModel.operatorSelectionModel.value, (value) =>
        runDurationFilterModel.operatorSelectionModel.select(value));
};
