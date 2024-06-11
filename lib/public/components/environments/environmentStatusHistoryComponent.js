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

import { coloredEnvironmentStatusComponent } from '../../views/Environments/ColoredEnvironmentStatusComponent.js';
import { h } from '/js/src/index.js';
import { StatusAcronym } from '../../domain/enums/statusAcronym.mjs';

/**
 * Returns a legend for the environment status history acronyms.
 *
 * @return {Component} the resulting environment status history legend component
 */
export const environmentStatusHistoryLegendComponent = () =>
    h('', [
        h('h5', 'Status History Legend'),
        Object.keys(StatusAcronym).map((status) =>
            h('.flex-row.justify-between', [
                h('', status),
                h('', StatusAcronym[status]),
            ])),
    ]);

/**
 * Returns a tooltip legend for the environment status history acronyms.
 *
 * @param {{status: string, acronym: string}[]} statusHistory list of history items (full status and their acronym)
 * @return {Component} the resulting environment status history component
 */
export const environmentStatusHistoryComponent = (statusHistory) => statusHistory.flatMap((value) => [
    '-',
    coloredEnvironmentStatusComponent(value.status, value.acronym),
]).slice(1);
