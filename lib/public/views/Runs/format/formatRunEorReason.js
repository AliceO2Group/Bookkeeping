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
import { formatEorReason } from './formatEorReason.mjs';

/**
 * Display the given EoR reason as a vnode component with a tooltip containing the name of its last editor
 *
 * @param {Partial<{
 *   category: string,
 *   title: string,
 *   description: string,
 *   lastEditedBy: {name: string}|null,
 * }>} eorReason the EoR reason to display
 * @return {VNode} the vnode component
 */
export const formatRunEorReason = (eorReason) => {
    const lastEditorName = eorReason.lastEditedBy?.name;
    const reasonText = formatEorReason(eorReason);
    return h('.w-100.flex-row.justify-between', [
        h('', reasonText),
        lastEditorName ? tooltip(h('.w-wrapped', lastEditorName), 'Last edited by') : null,
    ]);
};
