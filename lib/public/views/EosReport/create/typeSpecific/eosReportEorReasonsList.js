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
 * Format a list of end of run reasons to be displayed in an end of shift report
 *
 * @param {EorReason[]} eorReasons the list of EoR reasons to display
 * @return {Component|null} the formatted EoR reasons
 */
export const eosReportEorReasonsList = (eorReasons) => eorReasons.length > 0
    ? h('li', [
        'EOR:',
        h('ul', eorReasons.map(({ category, title, description }) => {
            let ret = category;
            if (title) {
                ret += ` - ${title}`;
            }
            ret += ` - ${description}`;
            return h('li', ret);
        })),
    ])
    : null;
