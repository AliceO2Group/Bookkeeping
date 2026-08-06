/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

/**
 * Logger based middleware generator
 *
 * @param {Class} logger class that exposes an infoMessage function that recceives the request and then sends specific data to InfoLogger
 * @return {(function(*, *, *): void)} the infoLoggerListener middleware
 */
exports.infoLoggerListenerMiddleware = (logger) => (request, _response, next) => {
    logger.infoMessage(request);
    next();
};
