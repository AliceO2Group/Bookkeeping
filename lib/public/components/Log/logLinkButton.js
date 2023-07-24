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
import { iconLinkIntact } from '/js/src/icons.js';
import { clipboardTarget } from '/components/common/clipboardTarget.js';

/**
 * Copies the url of the log to the clipboard
 * @param {Log} log the log object that this button corresponds to
 * @return {Component} The link button.
 */
export const logLinkButton = (log) => {
    // TODO: absolute url
    const url = new URL(window.location.href);
    url.searchParams.set('id', log.id);

    return clipboardTarget(url, 'button.btn.btn-primary.mr1', h('div', { id: `copy-${log.id}` }, iconLinkIntact()));
};
