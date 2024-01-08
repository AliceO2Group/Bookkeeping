/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

/**
 * Default size for functions call cache
 * @type {number}
 */
const DEFAULT_FUNCTION_CACHE_SIZE = 100;

/**
 * Wrap a given function calls in an in-memory cache, to not call it again when trying to call it with the same parameters
 *
 * @template {(function(*): Promise<*>)} F the signature of the function to cache
 * @param {function} toCache the function to wrap in cache system
 * @param {Object} [configuration={}] the caching configuration
 * @param {function} [configuration.argsToCacheKey] method applied on arguments to obtain a unique cache key
 * @param {function} [configuration.cacheSize] maximum amount of functions called to cache
 * @return {function} the cached function
 */
exports.cacheAsyncFunction = (toCache, configuration) => {
    const {
        argsToCacheKey = (...args) => JSON.stringify({ ...args }),
        cacheSize = DEFAULT_FUNCTION_CACHE_SIZE,
    } = configuration || {};

    const cache = new Map();
    const keysQueue = [];

    return async (...args) => {
        const cacheKey = argsToCacheKey(...args);
        if (!cache.has(cacheKey)) {
            const resultPromise = toCache(...args);
            cache.set(cacheKey, resultPromise);
            keysQueue.push(cacheKey);

            if (keysQueue.length > cacheSize) {
                const oldestKey = keysQueue.shift();
                cache.delete(oldestKey);
            }
        }
        return cache.get(cacheKey);
    };
};
