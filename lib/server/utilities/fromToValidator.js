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
 * Validates the from/to times for time filters.
 * @param {String} text pointer for attribute.
 * @param {Object} value request object
 * @returns {Array} Errors or null depending if an error is made
 */
function fromToValidator(text, value) {
    const errors = [];
    const from = value?.from ? new Date(value.from) : null;
    const to = value?.to ? new Date(value.to) : null;
    const endDay = new Date().setHours(23, 59, 59, 999);

    if (from && from > new Date()) {
        errors.push(attributeError(`${text}/from`, `Creation date must be today ${new Date()} or earlier`));
    }
    if (to) {
        to > endDay &&
            errors.push(attributeError(`${text}/to`, `Creation date must be today ${new Date(endDay)} or earlier`));
        if (from && from > to) {
            errors.push(attributeError(`${text}/to`, 'Creation date "to" cannot be before the "from" date '));
        }
    }
    return errors;
}

/**
 * Creates an error message that can be added to an errors array.
 * @param {String} attribute path to the attribute in error.
 * @param {String} message The given error message
 * @returns {Object} Error message
 */
function attributeError(attribute, message) {
    return {
        status: '422',
        source: { pointer: `/data/attributes/query/filter/${attribute}` },
        title: 'Invalid Attribute',
        detail: message,
    };
}

module.exports = fromToValidator;
