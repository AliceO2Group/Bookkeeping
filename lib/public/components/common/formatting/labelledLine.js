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
import { overflowBalloon } from '../popover/overflowBalloon.js';

/**
 * Display a value preceded by a small label, on its own line
 *
 * @param {string} id the id of the element containing the value
 * @param {string} label the label of the line
 * @param {Component|string} content the content of the line
 * @param {object} [options] the display options
 * @param {string} [options.labelClass] extra css classes of the label, to align the values of several lines for example
 * @param {boolean} [options.balloon] if false, the content is not wrapped in a balloon, as it already has its own popover (default true)
 * @return {Component} the line
 */
export const labelledLine = (id, label, content, { labelClass = '', balloon = true } = {}) => h('.flex-row.items-baseline.g1', [
    h('span.f7.gray-darker.flex-shrink-0', { class: labelClass }, label),
    h(`#${id}.min-w-0`, balloon ? overflowBalloon(content) : content),
]);
