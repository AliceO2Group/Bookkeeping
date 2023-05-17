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
 * Change the color of the status of the environment based off which status
 *
 * @param {String} status the status to check
 *
 * @return {vnode} the formatted status
 */
const setCorrectStatusColor = (status) => {
    switch (status) {
        case 'RUNNING':
            return h('', h('.green-status', status));
        case 'ERROR':
            return h('', h('.red-status', status));
        case 'CONFIGURED':
            return h('', h('.orange-status', status));
        default:
            return h('', h('', status));
    }
};

/**
 * Change the color of the status of the environment based off which status
 *
 * @param {String} color Color to be applied to the style of a String
 *
 * @return {{style: string}} the style object for a status
 */
export { setCorrectStatusColor };
