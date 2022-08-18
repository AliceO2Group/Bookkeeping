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
    run: {
        StartRunUseCase,
    },
} = require('../../../../lib/usecases');

/**
 * Implementation of gRPC RunService
 */
class GRPCRunService {
    /**
     * Grpc service implementation
     *
     * @param {object} call the grpc call
     * @param {function} callback the grpc callback
     *
     * @return {void}
     */
    Create(call, callback) {
        new StartRunUseCase().execute({ body: call.request }).then(({ result, error }) => {
            callback(null, { run: result?.run, error });
        });
    }
}

exports.RunService = GRPCRunService;
