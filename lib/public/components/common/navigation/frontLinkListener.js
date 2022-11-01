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

const frontLinkListeners = [];

/**
 * Register a function to be called any time one of the frontLink is triggered (the navigation event will be passed as parameter)
 *
 * @param {callback} listener the listener to register
 *
 * @return {void}
 */
export const registerFrontLinkListener = (listener) => {
    frontLinkListeners.push(listener);
};

/**
 * Notify all registered front link listeners
 *
 * @param {Event} e the navigation event
 * @return {boolean} false if any of the listener returned false else true
 */
export const notifyFrontLinkListeners = (e) => {
    for (const listener of frontLinkListeners) {
        if (listener(e) === false) {
            return false;
        }
    }
    return true;
};
