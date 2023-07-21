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

/**
 * Copies a given text to the clipboard if the window is secure
 * @param {copyText} copyText the text to copy
 * @param {Component} children components
 * @return {Component} the children components wrapped in the clipboardTarget
 */
export const clipboardTarget = (copyText, children) => {
    return h('a', {onclick: (e) => {
        e.preventDefault();
        if (window.isSecureContext) navigator.clipboard.writeText(copyText);
    }}, children
)};
