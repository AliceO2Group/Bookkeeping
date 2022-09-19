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
 * Wrap a value that may or may not be a promise in a promise
 *
 * If the given value is already a promise, return it. Else, return a promise that resolve immediately with `value`.
 * This function can be used to `await` a value that may or may not be a Promise
 *
 * @template T
 * @param {T|Promise<T>} value the value to wrap
 * @return {Promise<T>} the promise that resolve with value or value
 */
exports.awaitIfNeeded = async (value) => value;
