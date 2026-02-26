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
import { tooltip } from '../../../../components/common/popover/tooltip.js';

/**
 * Format the given EoR reason to string
 *
 * @param {Partial<{
 *   category: string,
 *   title: string,
 *   description: string,
 *   lastEditedName: string,
 * }>} eorReason the EoR reason to format
 * @return {string} the result
 */
export const formatEorReason = (eorReason) => {
    const { category, title, description, lastEditedName } = eorReason;
    const reasonText = [category, title, description].filter((item) => item).join(' - ');
    return h('.w-100.flex-row.justify-between', [
        h('', reasonText),
        tooltip(h('.w-wrapped', `${lastEditedName}`), 'Last edited by'),
    ]);
};
