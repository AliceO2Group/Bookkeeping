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

const { logService } = require('../../services/log/LogService.js');

/**
 * Controller to handle requests through gRPC LogService
 */
class GRPCLogController {
    /**
     * Constructor
     */
    constructor() {
        this.logService = logService;
    }

    // eslint-disable-next-line jsdoc/require-jsdoc
    Create({ title, text, parentLogId, runNumbers }) {
        return this.logService.create({ title, text, parentLogId }, runNumbers);
    }
}

module.exports = { GRPCLogController };
