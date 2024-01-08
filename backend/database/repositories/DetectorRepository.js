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

const {
    models: {
        Detector,
    },
} = require('../');
const Repository = require('./Repository');

/**
 * Sequelize implementation of the DetectorRepository.
 */
class DetectorRepository extends Repository {
    /**
     * Creates a new `DetectorRepository` instance.
     */
    constructor() {
        super(Detector);
    }
}

module.exports = new DetectorRepository();
