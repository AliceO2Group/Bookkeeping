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
 * @param {String} status the status to check, format and return
 *
 * @return {vnode} the formatted status
 */
const setCorrectStatusColor = (status) => {
    switch (status) {
        case 'RUNNING':
            return h('.success', status);
        case 'ERROR':
            return h('.danger', status);
        case 'CONFIGURED':
            return h('.warning', status);
        default:
            return h('', status);
    }
};

export { setCorrectStatusColor };
