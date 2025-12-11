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
 * Component to filter LHC-fills by beam duration
 *
 * @param {rawTextFilter} beamDurationFilterModel beamDurationFilterModel
 * @param {string} beamDurationOperator beam duration operator value
 * @param {(string) => undefined} beamDurationOperatorUpdate beam duration operator setter function
 * @returns {Component} the text field
 */
export const beamDurationFilter = (beamDurationFilterModel, beamDurationOperator, beamDurationOperatorUpdate) => {
    const amountFilter = rawTextFilter(
        beamDurationFilterModel,
        { classes: ['w-100', 'beam-duration-filter'], placeholder: 'e.g 16:14:15 (HH:MM:SS)' },
    );

    return comparisonOperatorFilter(amountFilter, beamDurationOperator, (value) => beamDurationOperatorUpdate(value));
};
