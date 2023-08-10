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
 * For some given fields, returns the hyperscript to display those fields in the form
 * <name>: <formatted data>
 * @param {Log} log the log
 * @param {string[]} fields the names of the fields to display
 * @param {Object} fieldFormats an object containing a format function for each field
 * @return {Component} the log field displayed
 */
export const logDetails = (log, fields, fieldFormats) => fields.map((key) =>
    h(`div#log-${log.id}-${key}.flex-row`, [
        h('div.mr2', `${fieldFormats[key].name}:`),
        fieldFormats[key].format(log[key]),
    ]));
