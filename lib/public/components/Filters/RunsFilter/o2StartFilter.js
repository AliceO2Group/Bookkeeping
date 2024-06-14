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

import { timeRangeFilter } from '../common/filters/timeRangeFilter.js';

/**
 * Returns a filter to be applied on run start
 *
 * @param {RunsOverviewModel} runsOverviewModel the run overview model object
 * @return {Component} the filter component
 */
export const o2StartFilter = (runsOverviewModel) => timeRangeFilter(runsOverviewModel.o2StartFilterModel);
