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
 * Function that sets a time range in a QueryBuilder.
 *
 * @param {object} timerange an object that defines a time range to add to the query
 * @param {number} timerange.from the lower bound of the time range
 * @param {number} timerange.to the upper bound of the time range
 * @param {string} attribute the model attribute for which the range will be set
 * @param {QueryBuilder} queryBuilder queryBuider instance in which the time range will be set.
 * @returns {void}
 */
export function setTimeRangeQuery({ from = 0, to = Date.now() }, attribute, queryBuilder) {
    queryBuilder.where(attribute).between(from, to);
}
