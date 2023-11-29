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

import { clipboardTarget } from '/components/common/clipboardTarget.js';
import { h } from '/js/src/index.js';

/**
 * Copies the buttongroup identifier to the clipboard based on the given key and value
 *
 * @param {string} key the key that specifies what indetifier to copy
 * @param {string} value the value that specifies what identifier to copy
 * @return {clipboardTarget} the copyButtonGroupIdentifier component wrapped in a clipboardTarget component
 */
export const copyButtonGroupIdentifier = (key, value) => {
    const component = h('button.btn.btn-primary.w-100', {
        id: `copy-${value}`,
        onclick: () => {
            const element = document.getElementById(`copy-${value}`);
            element.innerHTML = `Copied!`;
            setTimeout(() => {
                element.innerHTML = `Copy ${key}`; 
            }, 2000);
        },
    }, h('div.flex-row.g1', `Copy ${key}`));

    return clipboardTarget(value, component, () => { });
};
