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
 *  Show certain
 *
 *  @param {Object} request blah
 *
 *  @param {Object} response blah
 *
 *  @returns {undefined}
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
 *  Show certain
 *
 *  @param {Object} request blah
 *
 *  @param {Object} response blah
 *
 *  @returns {undefined}
 */
const getDatabaseInformation = async (request, response) => {
    const gui = await new GetDatabaseStatusUseCase()
        .execute();

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

module.exports = {
    getGuiInformation,
    getDatabaseInformation,
};
