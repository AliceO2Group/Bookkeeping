/**
 *
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

const LHC_PERIOD_NAME_REGEX = /^LHC\d\d[a-zA-Z]+/;

/**
 * Extract lhc period {name, year} for given data/simulation pass
 * @param {string} name name of data pass or simulation pass, like LHC22a_apass1, lhc period name is acceptable as well
 * @returns {{name: string, year: number}} lhc period
 */
function extractLhcPeriod(name) {
    const [extractedName] = name.split('_');
    if (! LHC_PERIOD_NAME_REGEX.test(extractedName)) {
        return null;
    }
    return {
        name: extractedName,
        year: 2000 + Number(extractedName.slice(3, 5)),
    };
}

exports.LHC_PERIOD_NAME_REGEX = LHC_PERIOD_NAME_REGEX;

exports.extractLhcPeriod = extractLhcPeriod;
