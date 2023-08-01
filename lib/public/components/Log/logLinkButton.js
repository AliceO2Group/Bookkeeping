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

/**
 * Copies the url of the log to the clipboard
 * @param {Log} log the log object that this button corresponds to
 * @param {function} onCopyUrlSuccess a callback to the model so it can rerender the page
 * @return {Component} The link button.
*/
export const logLinkButton = (log, showSuccessContent, onCopyUrlSuccess) => {
    const url = `${window.location.origin}/?page=log-detail&id=${log.id}`;
    
    const defaultContent = [iconLinkIntact(), h('', 'Copy Link')];
    const successContent = [iconCheck(), h('', 'Copied!')]

    return clipboardTarget(
        url, 
        h('button.btn.btn-primary', { id: `copy-${log.id}` }, h('div.flex-row.g1', showSuccessContent ? successContent : defaultContent)),
        () => { onCopyUrlSuccess();}
    )
};
