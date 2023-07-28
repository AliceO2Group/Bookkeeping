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
import { iconLinkIntact, iconCheck } from '/js/src/icons.js';
import { clipboardTarget } from '/components/common/clipboardTarget.js';

const defaultContent = [iconLinkIntact(), h('', 'Copy Link')];
const successContent = [iconCheck(), h('', 'Copied!')]

let showSuccessContent = false;

/**
 * Copies the url of the log to the clipboard
 * @param {Log} log the log object that this button corresponds to
 * @param {function} onCopyUrlSuccess a callback to the model so it can rerender the page
 * @return {Component} The link button.
 */
export const logLinkButton = (log, onCopyUrlSuccess) => {
    const url = `${window.location.origin}/?page=log-detail&id=${log.id}`;
    return clipboardTarget(
        url, 
        h('button.btn.btn-primary.mr1', { id: `copy-${log.id}` }, h('div.flex-row.g1', showSuccessContent ? successContent : defaultContent)),
        () => {
            showSuccessContent = true; 
            setTimeout(() => {showSuccessContent = false; onCopyUrlSuccess()}, 2000); 
        }
    )
};
