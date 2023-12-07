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
import { StatefulComponent } from '../common/StatefulComponent.js';

class CopyToClipboardComponent extends StatefulComponent {
    // Store the timeout for success state display
    constructor() {
        super();
        this._successStateTimeout = null;
    }

    // This is the function mithril uses to render the component, see https://mithril.js.org/archive/v1.1.7/components.html
    view(vnode) {
        const {
            // What you have in attrs here is what you specified as 2nd parameter in the `h` call
            attrs,
            // What you have in children is the 2rd parameter in the `h` call, it is the children of the vnode
            children,
        } = vnode;

        const {
            target: clipboardTargetValue = '',
        } = attrs;

        const defaultContent = [iconLinkIntact(), children];
        const successContent = [iconCheck(), h('', 'Copied!')];

        return h(
            'button.btn.btn-primary',
            {
                class: 'copy-to-clipboard',
                onclick: () => {
                    if (window.isSecureContext) {
                        navigator.clipboard.writeText(clipboardTargetValue);
                        this._successStateTimeout = setTimeout(() => {
                            this._successStateTimeout = null;
                            this.notify();
                        }, 2000);
                        this.notify();
                    }
                },
            },
            h('div.flex-row.g1', this._successStateTimeout ? successContent : defaultContent),
        );
    }
}

/**
 * Copies the url of the log to the clipboard
 * @param {Log} log the log object that this button corresponds to
 * @param {boolean} showSuccessContent an indicator as to whether to display feedback to the user that the url was copied to the clipboard
 * @param {function} onCopyUrlSuccess a callback to the model, so it can rerender the page
 * @return {Component} The link button.
 */
export const logLinkButton = (log, showSuccessContent, onCopyUrlSuccess) => {
    const url = `${window.location.origin}/?page=log-detail&id=${log.id}`;

    return h(
        // Notice we pass the component class here, not an instance! Because mithril will reuse the class instances if it can
        // This allows us to store the state in the component. If we don't use a class component but for example a variable locale to the
        // function, its value will be reseted every time we call `logLinkButton`
        CopyToClipboardComponent,
        // This object will fill the `attrs` property of the vnode in view function of the component
        { target: url, onSuccess: onCopyUrlSuccess },
        // This object will fill the `children` property of the vnode in view function of the component
        'Copy link',
    );
};
