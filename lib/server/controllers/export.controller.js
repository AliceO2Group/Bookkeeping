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

const {
    dtos: {
        GetExportDto,
    },
} = require('../../domain');
const {
    lhcFill: {
        GetAllLhcFillsUseCase,
    },
} = require('../../usecases');
const { dtoValidator } = require('../utilities/index.js');
const { ExportComponents } = require('../../domain/enums/ExportComponents.js');
const CreateLhcFillDto = require('../../domain/dtos/CreateLhcFillDto.js');

/**
 * Export endpoint
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {undefined}
 */
const exportData = async (request, response) => {
    const value = await dtoValidator(GetExportDto, request, response);
    if (!value) {
        return;
    }

    let childDTO;
    let childUseCase;
    let childDataPropertyName;
    let childHasCount = false;

    // Decide on which DTO will be used to retrieve data.
    switch (value.query.exportComponent) {
        case ExportComponents.LHC_FILLS:
            childDTO = CreateLhcFillDto;
            childUseCase = new GetAllLhcFillsUseCase();
            childDataPropertyName = 'lhcFills';
            childHasCount = true;
            break;
        default:
            return;
    }

    // Validate child request value
    const childValue = await dtoValidator(childDTO, value.exportRequestData, response);

    // Retrieve data
    const childData = await childUseCase.execute(childValue);

    // Access childData by key.
    const childExportData = childData[childDataPropertyName];
    console.log(childExportData);

    // Process and pack data....




    // const { query: { page: { limit = ApiConfig.pagination.limit } = {} } } = value;
    // const totalPages = Math.ceil(count / limit);

    // response.status(200).json({
    //     data: lhcFills,
    // });
};

module.exports = {
    exportData,
};
