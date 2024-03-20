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

/**
 * Returns a create button component
 *
 * @param {function} onclick function called when button is clicked (if null, button will be disabled)
 * @param {string} [text='Create'] the button's text
 * @return {vnode} the button component
 */
export const createButton = (onclick, text = 'Create') => h(
    'button#submit.btn.btn-success',
    onclick ? { onclick } : { disabled: true },
    text,
);
