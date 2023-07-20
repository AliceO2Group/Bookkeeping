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
import {iconLinkIntact} from '/js/src/icons.js'

/**
 * Copies the url of the log to the clipboard
 * @param {onClick} the function to be called when clicked
 * @return {Component} The link button.
 */
export const linkButton = (log, onClick) => h('a.btn.btn-primary', {
    id: `copy-${log.id}`,
    style: 'margin-right: 5px',
    onclick: onClick,
}, iconLinkIntact());
