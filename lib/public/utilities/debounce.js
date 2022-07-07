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

export const INPUT_DEBOUNCE_TIME = 200;

/**
 * Return a function that call the given callback when the given waiting time has elapsed
 *
 * If the function is called multiple time during the wait time, only the last call will fire and after the wait time
 *
 * Do not use this function multiple time, use its return
 *
 * @param {function} callback the function to call after debounce time
 * @param {number} wait the debounce duration in milliseconds
 *
 * @return {function} the debounced version of callback
 */
export const debounce = (callback, wait) => {
    let timeout = null;
    return () => {
        clearTimeout(timeout);
        timeout = setTimeout(callback, wait);
    };
};
