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

const { AuthenticatedOnly } = require('../../../errors/AuthenticatedOnly.js');

/**
 * GRPC call pre-processor checking the identity eventually found in the call (call.identity)
 * For now, simply check for authenticated only
 */
class AuthorizationPreProcessor {
    /**
     * Constructor
     *
     * @param {boolean} allowAnonymous if false, unauthenticated calls will be rejected with {@see AuthenticatedOnly} error
     */
    constructor(allowAnonymous = false) {
        this._allowAnonymous = allowAnonymous;
    }

    /**
     * Process the gRPC call
     *
     * @param {Object} call the gRPC call
     * @return {void}
     */
    process(call) {
        const { identity } = call;
        if (!identity) {
            if (!this._allowAnonymous) {
                throw new AuthenticatedOnly('This service require authentication');
            }
        }
    }
}

exports.AuthorizationPreProcessor = AuthorizationPreProcessor;
