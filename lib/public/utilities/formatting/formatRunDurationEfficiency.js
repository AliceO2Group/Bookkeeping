/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */
import { h } from '/js/src/index.js';

/**
 * Format the runduration + efficiency into a formatted string
 *
 * @param {string|null} runDuration the run duration to format with formatterDuration
 * @param {string|null} efficiency the efficiency to format with formatterEfficiency
 * @param {function(runDuration)} formatterDuration - formatter that will format the duration and return the result
 * @param {function(efficiency)} formatterEfficiency - formatter that will format the efficiency and return the result
 * @return {vnode} the formatted result
 */
export const formatRunDurationEfficiency = (
    runDuration = '-',
    efficiency = '-',
    formatterDuration = (value) => value,
    formatterEfficiency = (value) => value,
) => h('', [formatterDuration(runDuration), h('br'), `(${formatterEfficiency(efficiency)})`]);
