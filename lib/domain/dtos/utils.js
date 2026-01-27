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
 * Used in Joi schemas to assert that the dataPassIds, simulationPassIds and lhcPeriodIds filters collectively contain exactly one ID
 *
 * @param {object} collections runs ids collections
 * @param {number[]} collections.dataPassIds data pass ids
 * @param {number[]} collections.simulationPassIds simulation pass ids
 * @param {number[]} collections.lhcPeriodIds LHC periods ids
 * @param {Joi.helpers} helpers joi helpers
 * @param {string} message to be send in case of filters refer to more than one runs collection
 * @returns {void}
 */
const singleRunsCollectionCustomCheck = ({ dataPassIds, simulationPassIds, lhcPeriodIds }, helpers, message) => {
    const runsCollectionFilters = [dataPassIds, simulationPassIds, lhcPeriodIds].filter(({ length } = {}) => length >= 1);

    if (runsCollectionFilters.length !== 1 || runsCollectionFilters[0].length !== 1) {
        return helpers.message(message);
    }
};

module.exports.singleRunsCollectionCustomCheck = singleRunsCollectionCustomCheck;
