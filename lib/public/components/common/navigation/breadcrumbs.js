/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { h, iconChevronRight } from '/js/src/index.js';

/**
 * Create Breadcrumbs out of provided items, each items is preceded by rightChevron Icon
 * @param {Component[]} items items in breadcrumbs
 * @return {Component} breadcrumbs
 */
export const breadcrumbs = (...items) => h('.flex-row.g1.items-center', [
    items[0],
    ...items.slice(1).flatMap((item) => [iconChevronRight(), item]),
]);
