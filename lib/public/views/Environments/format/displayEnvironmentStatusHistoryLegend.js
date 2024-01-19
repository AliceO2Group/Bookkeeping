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
import { STATUS_ACRONYMS } from '../../../domain/enums/statusAcronyms.js';
import { tooltip } from '../../../components/common/popover/tooltip.js';

/**
 * Display a tooltip legend for the environment status history acronyms.
 *
 * @param {Component} trigger the element which will display the status history legend when hovered
 * @return {Component} the resulting environment status history legend component
 */
export const displayEnvironmentStatusHistoryLegend = (trigger) =>
    tooltip(trigger, h('', [
        h('h5', 'Status History Legend'),
        Object.keys(STATUS_ACRONYMS).map((status) =>
            h('.flex-row.justify-between', [
                h('', status),
                h('', STATUS_ACRONYMS[status]),
            ])),
    ]));
