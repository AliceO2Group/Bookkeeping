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

import { rawTextFilter } from './rawTextFilter.js';

/**
 * Standardised component for a rawTextFilter that span the width of their container
 *
 * @param {FilteringModel} filteringModel the page's filteringModel
 * @param {string} key the identifier to serve as css selector and to fetch the correct filter from the filteringModel
 * @param {string} placeholder placeholder text for the input element
 * @return {Component} the filter
 */
export const textInputFilter = (filteringModel, key, placeholder) =>
    rawTextFilter(filteringModel.get(key), { classes: ['w-100', `${key}-filter`], placeholder });
