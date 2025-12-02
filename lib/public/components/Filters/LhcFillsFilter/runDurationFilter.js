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
 * @param {rawTextFilter} runDurationFilterModel runDurationFilterModel
 * @param {string} runDurationOperator run duration operator value
 * @param {(string) => undefined} runDurationOperatorUpdate run duration operator setter function
 * @returns {Component} the text field
 */
export const runDurationFilter = (runDurationFilterModel, runDurationOperator, runDurationOperatorUpdate) => {
    const amountFilter = rawTextFilter(
        runDurationFilterModel,
        { classes: ['w-100', 'run-duration-filter'], placeholder: 'e.g 16:14:15 (HH:MM:SS)' },
    );

    return comparisonOperatorFilter(amountFilter, runDurationOperator, (value) => runDurationOperatorUpdate(value));
};
