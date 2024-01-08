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
 * Considering a map of counters indexed by keys, increment (and create if needed) the counter for the given index
 *
 * @template K
 *
 * @param {K} index the index of the counter to increment
 * @param {Map<K, number>} indexedCounters the indexed counters
 *
 * @return {void}
 */
export const incrementIndexedCounters = (index, indexedCounters) => {
    if (!indexedCounters.has(index)) {
        indexedCounters.set(index, 0);
    }
    indexedCounters.set(index, indexedCounters.get(index) + 1);
};
