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
 * Types of clients of the API, as identified from the user agent the request contains
 */
exports.ApiClients = Object.freeze({
    BROWSER: 'browser',
    CURL: 'curl',
    WGET: 'wget',
    PYTHON: 'python',
    NODE: 'node',
    GO: 'go',
    JAVA: 'java',
    POSTMAN: 'postman',
    GRPC_NODE: 'grpc-node',
    GRPC_CXX: 'grpc-cxx',
    GRPC_PYTHON: 'grpc-python',
    GRPC_GO: 'grpc-go',
    GRPC_JAVA: 'grpc-java',
    GRPC_OTHER: 'grpc-other',
    UNKNOWN: 'unknown',
});
