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

const { WebUiServer } = require('./WebUiServer');
const { GRPCServer } = require('./GRPCServer.js');

const webUiServer = new WebUiServer();

exports.webUiServer = webUiServer;

// Because web ui server creates its own token service and do not use DI, we use its instance and pass it to gRPC server
exports.gRPCServer = new GRPCServer(webUiServer.http.o2TokenService);
