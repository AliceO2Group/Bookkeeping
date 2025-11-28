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

import { rawTextFilter } from '../common/filters/rawTextFilter.js';

/**
 * Component to filter LHC-fills by fill number
 *
 * @param {RawTextFilterModel} filterModel the filter model
 * @returns {Component} the text field
 */
export const fillNumberFilter = (filterModel) => rawTextFilter(
    filterModel,
    { classes: ['w-100', 'fill-numbers-filter'], placeholder: 'e.g. 6, 3, 4' },
);
