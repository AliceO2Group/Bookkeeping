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

const { ApiConfig } = require('../../config/index.js');
const { BEAM_TYPES } = require('../../domain/enums/BeamType.js');

/**
 * GetAllBeamsTypesUseCase
 */
class GetAllBeamsTypesUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The GetAllBeamsTypes DTO which contains all request data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto = {}) {
        // DTO data to be used if Database data is desired.
        const { query = {} } = dto;
        const { page = {} } = query;
        const { limit = ApiConfig.pagination.limit, offset = 0 } = page;

        const beamsTypes = BEAM_TYPES;
        return {
            count: beamsTypes.length,
            beamsTypes,
        };
    }
}

module.exports = GetAllBeamsTypesUseCase;
