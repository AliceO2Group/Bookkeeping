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
import { iconLinkIntact, iconCheck } from '/js/src/icons.js';
import { clipboardTarget } from '/components/common/clipboardTarget.js';

/**
 *  Renders a copyToClipboardButton component that copies a given value to the clipboard.
 *
 * @param {string} key the key that specifies what value to copy
 * @param {string} value the value that will be copied to the clipboard
 * @param {boolean} showCopySuccessContent an indicator as to whether to display feedback to the user that the value was copied
 * @param {function} onCopySuccess a callback to the model so it can rerender the page
 * @return {clipboardTarget} the copyToClipboardButton component wrapped in a clipboardTarget
 */
export const copyToClipboardButton = (key, value, showCopySuccessContent, onCopySuccess) => {
    const defaultContent = [iconLinkIntact(), h('', `Copy ${key}`)];
    const successContent = [iconCheck(), h('', 'Copied!')];

    return clipboardTarget(
        value,
        h(
            'button.btn.btn-primary.w-100',
            { id: `copy-${key}` },
            h(
                'div.flex-row.g1',
                showCopySuccessContent ? successContent : defaultContent,
            ),
        ),
        () => {
            onCopySuccess();
        },
    );
};
