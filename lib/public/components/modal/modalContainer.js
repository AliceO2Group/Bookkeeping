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
import { ModalHandler } from './ModalHandler.js';
import { taggedEventRegistry } from '../../utilities/taggedEventRegistry.js';

const CLICK_ON_MODAL_EVENT_TAG = 'click-on-modal';

/**
 * Display a component where modals can be displayed
 *
 * @param {ModalModel} modalModel the model handling the currently displayed modal(s)
 * @return {vnode|null} the resulting component, null if there is no modal currently displayed
 */
export const modalContainer = (modalModel) => {
    const currentModal = modalModel.current;
    if (currentModal === null) {
        return null;
    }

    const { content, dismissButton = true, size = null } = currentModal;

    const classes = [
        'modal',
        size ? `modal-${size}` : null,
    ].filter((clazz) => Boolean(clazz)).join('.');

    /**
     * Dismiss the current modal
     *
     * @return {void}
     */
    const dismissCurrent = () => modalModel.dismiss(currentModal);

    return h(
        '.modal-container',
        {
            oncreate: () => taggedEventRegistry.addListenerForAnyExceptTagged(dismissCurrent, CLICK_ON_MODAL_EVENT_TAG),
            onremove: () => taggedEventRegistry.removeListener(dismissCurrent),
        },
        h(
            `.${classes}`,
            {
                onclick: (e) => taggedEventRegistry.tagEvent(e, CLICK_ON_MODAL_EVENT_TAG),
            },
            [
                dismissButton && h('button.modal-dismiss.btn.btn-danger', {
                    onclick: () => dismissCurrent(),
                    title: 'Dismiss',
                }, '\u00D7'),
                typeof content === 'function' ? content(new ModalHandler(dismissCurrent)) : content,
            ],
        ),
    );
};
