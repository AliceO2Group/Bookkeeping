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

import { rawTextFilter } from '../common/filters/rawTextFilter.js';

/**
 * Component to filter runs on run number
 *
 * @param {RawTextFilterModel} filterModel the filter model
 * @return {Component} the filter
 */
export const runNumbersFilter = (filterModel) => rawTextFilter(
    filterModel,
    { classes: ['w-100', 'run-numbers-filter'], placeholder: 'e.g. 534454, 534455...' },
);
