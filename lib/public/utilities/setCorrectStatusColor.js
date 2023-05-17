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

import { h } from '@aliceo2/web-ui/Frontend/js/src';

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
            return h(setColor('green'), status);
        case 'ERROR':
            return h(setColor('red'), status);
        case 'CONFIGURED':
            return h(setColor('orange'), status);
        case 'DESTROYED' || 'DEPLOYED' || 'STANDBY':
            return h(status);
    }
};

/**
 * Change the color of the status of the environment based off which status
 *
 * @param {String} color Color to be applied to the style of a String
 *
 * @return {{style: string}} the style object for a status
 */
const setColor = (color) => ({ style: `${color}` });

export { setCorrectStatusColor };
