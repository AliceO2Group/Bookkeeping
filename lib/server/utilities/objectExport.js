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

const { generateCsv, mkConfig } = require('export-to-csv');
const { headerCollection, objectsFlattener } = require('./objectFlatten');

// TODO fix this
const { dtos: { GetAllLhcFillsDto, GetAllRunsDto } } = require('../../domain');
const { ExportComponentName } = require('../../domain/enums/ExportComponentName');
const { DataExportTypes } = require('../../public/domain/enums/DataExportTypes');
const { GetAllLhcFillsUseCase } = require('../../usecases/lhcFill');
const { GetAllRunsUseCase } = require('../../usecases/run');
const { dtoValidator } = require('./dtoValidator');

/**
 * @typedef ExportComponent
 * Requires componentName, other properties are added by objectExport.js
 *
 * @property {ExportComponentName} componentName
 * @property {Joi.ObjectSchema<any>} componentDTO
 * @property {any} componentUseCase
 */

/**
 * ObjectExport
 */
class ObjectExport {
    /**
     * Constructor
     * @param {ExportComponent} exportComponent - Component to export
     * @param {Express.Request} query - http request query parameters for childDTO/Usecase send to export.controller
     */
    constructor(exportComponent, query) {
        this.exportComponent = exportComponent;
        this.childRequest = { query, body: {}, params: {} };
    }

    /**
     * Main export function that will return the CSV or JS object data.
     * @param {DataExportTypes} exportFormat - format requested for the export, option JSON does not
     * return JSON but instead the JS object with the data, this is due to ExpressJS having a convenience method
     * for converting to JSON that also sets the right headers.
     */
    async export(exportFormat) {
        // Prepare and validate request using Child DTO
        const childData = await this.#requestValidationDataRetrieval();
        let headers;
        // JSON export
        if (exportFormat === DataExportTypes.JSON) {
            return childData;
        } else {
            // TODO undefined for later marker flexibility.
            headers = this.#calculateHeaders(childData, undefined);
            // The template object here does not serve a purpose yet,
            const template = this.#createTemplateObject(headers, false);
            // Create the array of objects to export to CSV.
            const exportObjectFlat = objectsFlattener(childData, template, false);

            headers.delete('REVERSEMARKER');
            const csvConfig = mkConfig({ useKeysAsHeaders: false, columnHeaders: Array.from(headers.values()) });
            const csv = generateCsv(csvConfig)(exportObjectFlat);
            return { csv, filename: `${csvConfig.filename}.csv` };
        }
    }

    /**
     * Calculate headers for the CSV export.
     * @param childExportData
     * @param reverseMarker
     */
    #calculateHeaders(childExportData, reverseMarker) {
        const requiredHeaders = headerCollection(childExportData);
        // Add hardcoded reverse marker for now...
        requiredHeaders.add('REVERSEMARKER');
        return requiredHeaders;
    }

    /**
     * D
     */
    async #requestValidationDataRetrieval() {
        switch (this.exportComponent.componentName) {
            case ExportComponentName.LHC_FILLS:
                this.exportComponent.componentDTO = GetAllLhcFillsDto;
                this.exportComponent.componentUseCase = new GetAllLhcFillsUseCase();
                break;
            case ExportComponentName.RUNS:
                this.exportComponent.componentDTO = GetAllRunsDto;
                this.exportComponent.componentUseCase = new GetAllRunsUseCase();
                break;
            default:
                return;
        }
        // Validate child request value
        const childValue = await dtoValidator(this.exportComponent.componentDTO, this.childRequest, {});

        // Retrieve data
        const childUseCaseData = await this.exportComponent.componentUseCase.execute(childValue);

        // Access childData by key.
        return childUseCaseData[this.exportComponent.componentName];
    }

    /**
     * CreateTemplateObject based on required properties, can be used to add dynamic data not present in dataset.
     * @param {Set} requiredProperties - unique collection of required properties for template object.
     * @param {boolean} reverseObjectPropertiesOrder - reverses the order of the properties on the template object.
     * @returns {object} - template object.
     */
    #createTemplateObject = (requiredProperties, reverseObjectPropertiesOrder = false) => {
        const templateObject = {};
        // Array.toReversed requires Node.js 20 (Release date: 2023-04-18) it creates a clone and does not modify the original array.
        const templateProperties = reverseObjectPropertiesOrder ? Array.from(requiredProperties.values()).toReversed() : requiredProperties;
        templateProperties.forEach((property) => {
            templateObject[property] = undefined;
        });
        return templateObject;
    };
}

module.exports = { ObjectExport };
