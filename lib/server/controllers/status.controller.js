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
    status: {
        GetGuiStatusUseCase,
        GetDatabaseStatusUseCase,
    } } = require('../../usecases');

/**
 *  Show gui information.
 *
 *  @param {Object} request express request object
 *
 *  @param {Object} response express response object
 *
 *  @returns {undefined} current gui information
 */
const getGuiInformation = async (request, response) => {
    const gui = await new GetGuiStatusUseCase()
        .execute(request);

    if (gui === null) {
        response.status(501).json({
            errors: [
                {
                    status: 501,
                    title: 'Something went wrong',
                },
            ],
        });
    } else {
        response.status(200).json({
            data: gui,
        });
    }
};

/**
 *  Retrieves the database status.
 *
 *  @param {Object} request express request object
 *
 *  @param {Object} response express response object
 *
 *  @returns {undefined} current database information
 */
const getDatabaseInformation = async (request, response) => {
    const information = await new GetDatabaseStatusUseCase()
        .execute();

    if (information === null) {
        response.status(501).json({
            errors: [
                {
                    status: 501,
                    title: 'Something went wrong',
                },
            ],
        });
    } else {
        response.status(200).json({
            data: information,
        });
    }
};

module.exports = {
    getGuiInformation,
    getDatabaseInformation,
};
