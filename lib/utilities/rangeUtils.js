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
 * Validates numbers ranges to not exceed 100 entities
 * Expects a string containing comma seperated number values.
 *
 * @param {string} value  The value to validate
 * @param {*} helpers The helpers object
 * @returns {Object} The value if validation passes
 */
export const RANGE_INVALID = 'range.invalid';

export const validateRange = (value, helpers) => {
    const MAX_RANGE_SIZE = 100;

    const numbers = value.split(',').map((number) => number.trim());

    for (const number of numbers) {
        if (number.includes('-')) {
            // Check if '-' occurs more than once in this part of the range
            if (number.lastIndexOf('-') !== number.indexOf('-')) {
                return helpers.error(RANGE_INVALID, { message: `Invalid range: ${number}` });
            }
            const parts = number.split('-');
            // Ensure exactly 2 parts and both are non-empty
            if (parts.length !== 2 || parts[0].trim() === '' || parts[1].trim() === '') {
                return helpers.error(RANGE_INVALID, { message: `Invalid range: ${number}` });
            }
            const [start, end] = parts.map((n) => Number(n));
            if (Number.isNaN(start) || Number.isNaN(end) || start > end) {
                return helpers.error(RANGE_INVALID, { message: `Invalid range: ${number}` });
            }
            const rangeSize = end - start + 1;

            if (rangeSize > MAX_RANGE_SIZE) {
                return helpers.error(RANGE_INVALID, { message: `Given range exceeds max size of ${MAX_RANGE_SIZE} range: ${number}` });
            }
        } else {
            // Single number - prevent non-numeric input using Number.isNaN for consistency
            const num = Number(number);
            if (Number.isNaN(num)) {
                return helpers.error(RANGE_INVALID, { message: `Invalid number: ${number}` });
            }
        }
    }

    return value;
};

/**
 * Unpacks a given string containing number ranges.
 * E.G. input: 5,7-9 => output: 5,7,8,9
 * @param {string[]} numbersRanges numbers that may or may not contain ranges.
 * @param {string} rangeSplitter string used to indicate and unpack a range.
 * @returns {Set<Number>} set containing the unpacked range.
 */
export function unpackNumberRange(numbersRanges, rangeSplitter = '-') {
    const resultNumbers = new Set();

    numbersRanges.forEach((number) => {
        if (number.includes(rangeSplitter)) {
            const [start, end] = number.split(rangeSplitter).map((n) => Number(n));
            if (!Number.isNaN(start) && !Number.isNaN(end) && start <= end) {
                for (let i = start; i <= end; i++) {
                    resultNumbers.add(i);
                }
            }
        } else {
            const num = Number(number);
            if (!Number.isNaN(num)) {
                resultNumbers.add(num);
            }
        }
    });
    return resultNumbers;
}
