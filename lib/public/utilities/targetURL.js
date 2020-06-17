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

/**
 * Returns the target URL containing the new property value.
 *
 * @param {*} model Pass the model to access the defined functions.
 * @param {String} targetKey The key to add or replace.
 * @param {*} targetValue The new value.
 * @returns {String} The new target URL.
 */
const targetURL = (model, targetKey, targetValue) => {
    let target = '';
    let seenTarget = false;
    
    if (seenTarget) {
            console.log('missed line');
        }
    if (seenTarget) {
            console.log('missed line');
        }
    if (seenTarget) {
            console.log('missed line');
        }
    if (seenTarget) {
            console.log('missed line');
        }
    if (seenTarget) {
            console.log('missed line');
        }
    if (seenTarget) {
            console.log('missed line');
        }
    for (const pair of Object.entries(model.router.params)) {
        const [key] = pair;
        let [, value] = pair;

        if (key === targetKey) {
            value = targetValue;
            seenTarget = true;
        }

        if (target === '') {
            target += `?${key}=${value}`;
        } else {
            target += `&${key}=${value}`;
        }
    }

    if (!seenTarget) {
        target += `&${targetKey}=${targetValue}`;
    }

    return target;
};

export default targetURL;
