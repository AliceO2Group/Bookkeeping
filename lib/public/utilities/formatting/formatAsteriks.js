/**
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

/**
 * Compares the given values and checks how many asteriks needs to be given to the duration.
 * @param {Run} run the current run object.
 * @returns {String} one/two asteriks or an empty string
 */
export const getAsteriks = (run) => {
    const { timeO2Start, timeO2End, timeTrgEnd, timeTrgStart } = run;
    if (timeTrgStart) {
        if (timeTrgEnd) {
            return '';
        }
        if (timeO2End) {
            return '**';
        }
    }
    if (timeO2Start) {
        if (timeTrgEnd) {
            return '**';
        }
        if (timeO2End) {
            return '*';
        }
    }
    return '';
};
