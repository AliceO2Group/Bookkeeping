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
 * Group a list of objects by one of their property
 *
 * @example If we have [{a: 1, b: 2}, {a: 2, b: 28}, {a: 1, b: -2}], grouping on property a will return [
 *     {index: 1, values: [{a: 1, b: 2}, {a: 1}, {b: -2}]},
 *     {index: 2, values: [{a: 2, b: 28}]}
 * ]
 *
 * @param {Object} items the list of objects to group
 * @param {string} property the property on which one objects will be grouped
 *
 * @return {{values: *, index: *}[]} an array of object, containing two properties: the index being the common value of the grouping property,
 *     and the values being the list of objects which have the current value as property
 */
exports.groupByProperty = (items, property) => {
    const groupedResult = items.reduce((accumulator, item) => {
        const index = item[property];
        if (!accumulator[index]) {
            accumulator[index] = [];
        }
        accumulator[index].push(item);
        return accumulator;
    }, []);

    return Object.entries(groupedResult).map(([key, value]) => ({ index: key, values: value }));
};
