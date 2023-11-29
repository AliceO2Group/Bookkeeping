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

/**
 * Represents a component responsible for the copy button within the InfoLoggerButtonGroup.
 * This component manages the functionality to copy the identifier to the clipboard
 * and handles the display of the copy button.
 */
export class CopyIdentifierComponent {
    /**
     * Constructor
     *
     * @constructor
     */
    constructor() {
        this._successStateTimeout = null;
    }

    /**
     * Renders the InfoLoggerButtonGroup's copy button component and handles its functionality.
     *
     * @param {Object} vnode the virtual DOM node.
     * @returns {Object} the rendered CopyIdentifierComponent component.
     */
    view(vnode) {
        const { attrs, children } = vnode;
        const { target: clipboardTargetValue } = attrs;

        const defaultContent = [iconLinkIntact(), children];
        const successContent = [iconCheck(), h('', 'Copied!')];

        return h(
            'button.btn.btn-primary w-100',
            {
                class: 'copy-to-clipboard',
                onclick: () => {
                    if (window.isSecureContext) {
                        navigator.clipboard.writeText(clipboardTargetValue);
                        this._successStateTimeout = setTimeout(() => {
                            this._successStateTimeout = null;
                        }, 2000);
                    }
                },
            },
            h('div.flex-row.g1', this._successStateTimeout ? successContent : defaultContent),
        );
    }
}
