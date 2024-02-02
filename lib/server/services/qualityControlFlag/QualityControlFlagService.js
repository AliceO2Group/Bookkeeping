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

const { repositories: { QualityControlFlagRepository } } = require('../../../database');
const { dataSource } = require('../../../database/DataSource.js');
const { BadParameterError } = require('../../errors/BadParameterError');
const { NotFoundError } = require('../../errors/NotFoundError');

/**
 * Quality control flags service
 */
class QualityControlFlagService {
    /**
     * Create quality control flag verification
     * @return {Promise<void>} promise
     * @throws {BadParameterError}
     */
    async createVerification({ qualityControlFlagId, user, comment }) {

    }

    /**
     * Create new instance of quality control flags
     * @param {QualityControlFlag} parameters flag instance parameters
     * @return {Promise<void>} promise
     */
    async create(parameters) {

    }

    /**
     * Get all quality control flags instances
     * @param {object} [filter] filtering defintion
     * @return {Promise<void>} promise
     */
    async getAll({ filter }) {

    }
}

module.exports.QualityControlFlagService = QualityControlFlagService;
