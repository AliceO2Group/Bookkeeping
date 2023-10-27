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

const { periodService } = require('../../services/periods/PeriodService');
const { stdDataRequestDTO } = require('../../domain/dtos');
const { validateDtoOrRepondOnFailure } = require('../utilities');
const { adaptFindAndCountAllInService } = require('../../utils');

/**
 * List All runs in db
 * @param {Object} req express HTTP request object
 * @param {Object} res express HTTP response object
 * @param {Object} next express next handler
 * @returns {undefined}
 */
const listPeriodsHandler = async (req, res, next) => {
    const validatedDTO = await validateDtoOrRepondOnFailure(stdDataRequestDTO, req, res);
    if (validatedDTO) {
        const periods = await periodService.getAll(validatedDTO.query);
        res.json(adaptFindAndCountAllInService(periods));
    }
};

module.exports = {
    listPeriodsHandler,
};
