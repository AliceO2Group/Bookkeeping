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

const { QueryTypes } = require('sequelize');
const {
    models: {
        Run,
    },
    sequelize,
} = require('../');
const Repository = require('./Repository');

/**
 * Sequelize implementation of the RunRepository.
 */
class RunRepository extends Repository {
    /**
     * Creates a new `RunRepository` instance.
     */
    constructor() {
        super(Run);
    }

    /**
     * Return the list of lhcfills id that contain these runnummbers
     * @returns {Promise<object[]>}
     */
    async getLhcFillByRunnumber() {
        return await sequelize.query(getLhcFillDistinctBeamTypesQuery(), { type: QueryTypes.SELECT, raw: true });
    }
}

module.exports = new RunRepository();
