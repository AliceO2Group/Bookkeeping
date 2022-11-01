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

import { jsonFetch } from './jsonFetch.js';

/**
 * Wrapper around {@see jsonFetch} sending GET request
 *
 * @param {string} endpoint the remote endpoint to send request to
 * @return {Promise<*>} resolve with the result of the request or reject with the list of errors if any error occurred
 */
export const getRemoteData = (endpoint) => jsonFetch(endpoint, { method: 'GET' });
