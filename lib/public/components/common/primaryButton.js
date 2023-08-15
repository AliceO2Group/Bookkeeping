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
 * Returns a button with the primary style
 *
 * @param {string} label the text that the button should show
 * @param {function} onclick function called when button is activated
 * @param {string} id Optional, the id of the html element. Useful for finding the button during tests.
 * @return {Component} the primary button component
 */
export const primaryButton = (label, onclick, id = '') => h('button.btn.btn-primary', {
    id,
    onclick,
}, label);
