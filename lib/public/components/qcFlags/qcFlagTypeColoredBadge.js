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

import { badge } from '../common/badge.js';
import { h } from '/js/src/index.js';

/**
 * Create colored badge for QC flag type
 * @param {QcFlagType} qcFlagType QC flag type
 * @return {Component} badge
 */
export const qcFlagTypeColoredBadge = ({ color, name }) => badge(h('span.flex-row.g1', name), { color });
