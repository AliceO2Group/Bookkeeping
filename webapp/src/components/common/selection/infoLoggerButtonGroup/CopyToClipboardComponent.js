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

import { h, iconLinkIntact, iconCheck } from '@aliceo2/web-ui-frontend';
import { StatefulComponent } from '../../StatefulComponent.js';

/**
 * Represents a component that allows copying text to the clipboard.
 */
export class CopyToClipboardComponent extends StatefulComponent {
    /**
     * Constructs a new CopyToClipboardComponent.
     */
    constructor() {
        super();
        this._successStateTimeout = null;
    }

    /**
     * Copies the specified text to the clipboard.
     *
     * @param {string} clipboardTargetValue The text to be copied to the clipboard.
     * @returns {void}
     */
    copyToClipboard(clipboardTargetValue) {
        navigator.clipboard.writeText(clipboardTargetValue);
        this._successStateTimeout = setTimeout(() => {
            this._successStateTimeout = null;
            this.notify();
        }, 2000);
        this.notify();
    }

    /**
     * Renders the button that allows copying text to the clipboard.
     *
     * @param {vnode} vnode The virtual DOM node containing the attrs and children.
     * @returns {Component} The copyToClipboard button component
     */
    view(vnode) {
        const { attrs, children } = vnode;
        const { value: clipboardTargetValue = '', id } = attrs;

        const defaultContent = [iconLinkIntact(), children];
        const successContent = [iconCheck(), h('', 'Copied!')];

        return h(
            'button.btn.btn-primary',
            {
                id: `copy-${id}`,
                onclick: () => this.copyToClipboard(clipboardTargetValue),
            },
            h('div.flex-row.g1', this._successStateTimeout ? successContent : defaultContent),
        );
    }
}
