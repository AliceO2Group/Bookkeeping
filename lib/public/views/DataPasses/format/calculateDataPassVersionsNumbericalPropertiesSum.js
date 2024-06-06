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
 * Format sum of numerical property of data pass versions
 *
 * @param {DataPassVersion[]} versions data pass versions
 * @param {string} property numerical property of data pass version
 * @return {Component} formatted sum of versions property
 */
export const calculateDataPassVersionsNumbericalPropertiesSum = (versions, property) => {
    const total = versions?.reduce((sum, version) => sum + (version[property] ?? 0), 0);
    const notAllNull = versions.some((version) => version[property] !== null);
    return notAllNull ? total : null;
};
