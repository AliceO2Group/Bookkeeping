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

const PROTO_DIR = `${__dirname}/../../proto`;

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { servicesImplementationsMappings } = require('./gRPC/servicesImplementationsMappings.js');

const LOADER_OPTIONS = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneof: true,
};

/**
 * GRPC server
 */
class GRPCServer {
    /**
     * Set up the gRpc server
     */
    constructor() {
        this._server = new grpc.Server();

        // TODO this is here to be uniform regarding to how HTTP routes are defined, but it should probably be configured later or somewhere else
        for (const [protoName, implementations] of Object.entries(servicesImplementationsMappings)) {
            implementations.forEach(({ service, implementation }) => {
                const proto = grpc.loadPackageDefinition(protoLoader.loadSync(`${PROTO_DIR}/${protoName}.proto`, LOADER_OPTIONS)).o2.bookkeeping;
                this._server.addService(service(proto), implementation);
            });
        }
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * Start the server
     *
     * @return {Promise<void>} a promise that resolve when the server has started
     */
    listen() {
        return new Promise((resolve) => this._server.bindAsync('[::]:4001', grpc.ServerCredentials.createInsecure(), () => {
            this._server.start();
            resolve();
        }));
    }
}

exports.GRPCServer = GRPCServer;
