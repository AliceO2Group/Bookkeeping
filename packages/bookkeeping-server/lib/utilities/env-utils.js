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

/**
 * Returns application mode
 * (value of environmental varaible 'NODE_ENV')
 * @returns {string} mode
 */
function getEnvMode() {
    return process.env.NODE_ENV;
}

/**
 * Returns wether or not to the application is in test mode.
 *
 * @returns {boolean} Wether or not to the application is in test mode.
 */
function isInTestMode() {
    return getEnvMode() === 'test';
}

/**
 * Returns wether or not to the application is in development mode.
 *
 * @returns {boolean} Wether or not to the application is in development mode.
 */
function isInDevMode() {
    return getEnvMode() === 'development';
}

module.exports = {
    isInTestMode,
    getEnvMode,
    isInDevMode,
};
