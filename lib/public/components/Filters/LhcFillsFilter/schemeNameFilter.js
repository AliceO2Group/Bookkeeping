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
 * Component to filter LHC-fills by scheme name
 *
 * @param {RawTextFilterModel} filterModel the filter model
 * @returns {Component} the text field
 */
export const schemeNameFilter = (filterModel) => rawTextFilter(
    filterModel,
    { classes: ['w-100', 'scheme-name-filter'], placeholder: 'e.g. Single_12b_8_1024_8_2018' },
);
