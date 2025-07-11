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

const { HttpConfig } = require('../config/index.js');
const { buildUrl } = require('@aliceo2/web-ui');

/**
 * Build a URL based on the frontend base URL and a list of query parameters
 *
 * @param {object} parameters the query parameters
 * @return {string} URL the built URL
 */
exports.frontUrl = (parameters) => buildUrl(
    HttpConfig.origin,
    parameters,
);
