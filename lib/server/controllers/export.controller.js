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
const { headerCollection, createTemplateObject, objectsFlattener } = require('../utilities/objectFlatten.js');
const GetLhcFillDto = require('../../domain/dtos/GetLhcFillDto.js');
const { DataExportTypes } = require('../../public/domain/enums/DataExportTypes.js');
const { mkConfig, generateCsv } = require('export-to-csv');
const GetAllRunsUseCase = require('../../usecases/run/GetAllRunsUseCase.js');
const GetAllRunsDto = require('../../domain/dtos/GetAllRunsDto.js');

const CONTENT_TYPE_HEADER = 'Content-Type';
const CONTENT_TYPE_DEFAULT = 'text/csv; charset=utf-8';
const CONTENT_DISPOSITION_HEADER = 'Content-Disposition';
const CONTENT_DISPOSITION_DEFAULT_PARTIAL = 'attachment; filename=';

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
    console.log('PARENT dto validating');
    const value = await dtoValidator(GetExportDto, request, response);
    if (!value) {
        return;
    }
    console.log('PARENT dto validated');

    let childDTO;
    let childUseCase;
    let childDataPropertyName;
    let childHasCount = false;
    let childRequest;

    // Decide on which DTO will be used to retrieve data.
    switch (value.query.exportComponent) {
        case ExportComponents.LHC_FILLS:
            console.log('LHC fill selected');
            childDTO = GetLhcFillDto;
            childUseCase = new GetAllLhcFillsUseCase();
            childDataPropertyName = 'lhcFills';
            childHasCount = true;
            // Clone request for the child DTO and remove the export specific query params.
            childRequest = request;
            delete childRequest.query.exportComponent;
            delete childRequest.query.exportFormat;
            break;
        case ExportComponents.RUNS:
            console.log('RUNS selected');
            childDTO = GetAllRunsDto;
            childUseCase = new GetAllRunsUseCase();
            childDataPropertyName = 'runs';
            childHasCount = true;
            // Clone request for the child DTO and remove the export specific query params.
            childRequest = request;
            delete childRequest.query.exportComponent;
            delete childRequest.query.exportFormat;
            break;
        default:
            response.status(400).json({
                errors: [
                    {
                        status: '400',
                        title: `export component with this name (${value.query.exportComponent}) is invalid`,
                    },
                ],
            });
            return;
    }

    // Validate child request value
    const childValue = await dtoValidator(childDTO, childRequest, response);
    console.log('CHILD dto validated');

    // Retrieve data
    const childData = await childUseCase.execute(childValue);
    console.log('CHILD data retrievd');

    // Access childData by key.
    const childExportData = childData[childDataPropertyName];
    console.log(childExportData);

    if (value.query.exportFormat === DataExportTypes.JSON) {
        // JSON export
        response.status(200).json(childExportData);
    } else {
        // CSV export, process and pack data....
        const requiredHeaders = headerCollection(childExportData);
        // Add hardcoded reverse marker for now...
        requiredHeaders.add('REVERSEMARKER');
        console.log('CHILD headers calculated');
        console.log(requiredHeaders);
        // Prepare an empty template object based on required properties.
        const templateObject = createTemplateObject(requiredHeaders);
        console.log('CHILD template made');
        console.log(requiredHeaders);
        // Create the array of objects to export to CSV.
        const exportObjectFlat = objectsFlattener(childExportData, templateObject, false);
        // console.log(exportObjectFlat);

        console.log('PRE config');
        const csvConfig = mkConfig({ useKeysAsHeaders: false, columnHeaders: Array.from(requiredHeaders.values()) });
        console.log('POST config');
        console.log('PRE GENERATE');
        const csv = generateCsv(csvConfig)(exportObjectFlat);
        console.log('PRE SEND');
        const filename = `${csvConfig.filename}.csv`;

        response.setHeader(CONTENT_TYPE_HEADER, CONTENT_TYPE_DEFAULT);
        response.setHeader(CONTENT_DISPOSITION_HEADER, `${CONTENT_DISPOSITION_DEFAULT_PARTIAL}"${filename}"`);
        response.send(csv);
    }
    return;
};

module.exports = {
    exportData,
};
