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
    const newParams = {
        ...model.router.params,
        [targetKey]: targetValue,
    };

    // eslint-disable-next-line require-jsdoc
    const getParameterExpression = (key, value) => `${key}=${value}`;
    return `?${Object.entries(newParams).map(([key, value]) => getParameterExpression(key, value)).join('&')}`;
};

export default targetURL;
