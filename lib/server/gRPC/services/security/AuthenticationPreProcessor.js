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

/**
 * GRPC call pre-processor filling call's identity by extracting and parsing token from metadata
 */
class AuthenticationPreProcessor {
    /**
     * Constructor
     *
     * @param {Object} o2TokenService the framework's token service
     */
    constructor(o2TokenService) {
        this._jwtService = o2TokenService;
    }

    /**
     * Process the gRPC call, setting its identity property if a token is found and can be parsed
     *
     * @param {Object} call the gRPC call
     * @return {Promise<void>}
     */
    async process(call) {
        const [authorization] = call.metadata?.get('authorization') ?? [];

        if (authorization) {
            const token = authorization?.substring('Bearer '.length);
            if (token) {
                try {
                    call.identity = await this._jwtService.verify(token);
                } catch (e) {
                    // TODO log failed authentication
                }
            }
        }
    }
}

exports.AuthenticationPreProcessor = AuthenticationPreProcessor;
