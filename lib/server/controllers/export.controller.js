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

const { dtoValidator } = require('../utilities/index.js');
const { DataExportTypes } = require('../../public/domain/enums/DataExportTypes.js');
const { ObjectExport } = require('../utilities/objectExport.js');

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
    const value = await dtoValidator(GetExportDto, request, response);
    if (!value) {
        return;
    }

    // Set query of  to the exportDTOQuery of the parent request.
    const objectExport = new ObjectExport({ componentName: value.query.exportComponent }, request.query.exportDTOQuery ?? {});

    if (value.query.exportFormat === DataExportTypes.JSON) {
        // JSON export
        const childExportData = await objectExport.export(DataExportTypes.JSON);
        response.status(200).json(childExportData);
    } else {
        const { csv, filename } = await objectExport.export(DataExportTypes.CSV);

        response.setHeader(CONTENT_TYPE_HEADER, CONTENT_TYPE_DEFAULT);
        response.setHeader(CONTENT_DISPOSITION_HEADER, `${CONTENT_DISPOSITION_DEFAULT_PARTIAL}"${filename}"`);
        response.send(csv);
    }
    return;
};

module.exports = {
    exportData,
};
