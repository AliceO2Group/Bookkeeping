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
const { updateExpressResponseFromNativeError } = require('../express/updateExpressResponseFromNativeError.js');
const { detectorsService } = require('../services/dpl/DetectorsService.js');

// eslint-disable-next-line valid-jsdoc
/**
 * Endpoint handler to list all dpl detectors
 * @return {Promise<void>} promise
 */
exports.listAllDetectorsHandler = async (_request, response) => {
    try {
        const detectors = await detectorsService.getAll();
        response.status(200).json({ data: detectors });
    } catch (error) {
        updateExpressResponseFromNativeError(response, error);
    }
};
