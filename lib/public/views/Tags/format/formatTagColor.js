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

import { h } from '/js/src/index.js';

/**
 * Format a tag with its correct color
 *
 * @param {Tag} tag The run detector quality per detector
 * @return {Component} Tag with its correct color
 */
export const formatTagColor = (tag) => h('.br2', { style: { backgroundColor: `#${tag.color}` } }, tag.text);
