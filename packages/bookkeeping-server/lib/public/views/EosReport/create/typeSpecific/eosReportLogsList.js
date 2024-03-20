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
import { frontLink } from '../../../../components/common/navigation/frontLink.js';

/**
 * Format a list of logs to be displayed in an end of shift report
 *
 * @param {Log[]} logs the logs to format
 * @return {Component} the formatted logs
 */
export const eosReportLogsList = (logs) => logs.length > 0
    ? h('li', [
        'Logs:',
        h('ul', logs.map((log) => h('.li.flex-row.g2', [
            h('li', `[${log.tags.length > 0 ? log.tags.map(({ text }) => text).join(', ') : '**No tags**'}]`),
            frontLink(log.title, 'log-detail', { id: log.id }, { onclick: () => true, target: '_blank' }),
        ]))),
    ])
    : null;
