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
 * Check if application is in test mode
 * @returns {Boolean} true if in test mode false otherwise
 */
function isInTestMode() {
    return process.env.ENV_MODE === 'test';
}

/**
 * Check if application is in dev mode
 * @returns {Boolean} true if in dev mode false otherwise
 */
function isInDevMode() {
    return process.env.ENV_MODE === 'development';
}

/**
 * Returns application mode
 * (value of environmental varaible 'ENV_MODE')
 * @returns {string} mode
 */
function getEnvMode() {
    return process.env.ENV_MODE;
}

module.exports = {
    isInDevMode,
    isInTestMode,
    getEnvMode,
};
