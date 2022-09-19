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

const { ConflictError } = require('../errors/ConflictError.js');
const { AuthenticatedOnly } = require('../errors/AuthenticatedOnly.js');

/**
 * Convert a js native error to a GRPC error
 *
 * @param {Error} error the native error to convert
 * @return {{code: number, message: string}} the gRPC error
 */
const nativeToGRPCError = (error) => {
    // Default to unknown error code
    let code = 2;
    const { message } = error;

    if (error instanceof ConflictError) {
        code = 6;
    } else if (error instanceof AuthenticatedOnly) {
        code = 16;
    }

    return {
        code,
        message,
    };
};

exports.nativeToGRPCError = nativeToGRPCError;
