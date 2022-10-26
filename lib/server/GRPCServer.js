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
const { bindGRPCController } = require('./gRPC/bindGRPCController.js');
const { extractAbsoluteMessageDefinitions } = require('./gRPC/services/protoParsing/extractAbsoluteMessageDefinitions.js');

/**
 * Return the default loader options to load proto files
 *
 * @param {string} protoDir the root directory of the proto files
 * @return {Object} loader options
 */
const getLoaderOptions = (protoDir) => ({
    keepCase: true,
    longs: Number,
    enums: String,
    defaults: true,
    oneof: true,
    includeDirs: [`${protoDir}`],
});

/**
 * GRPC server
 */
class GRPCServer {
    /**
     * Set up the gRpc server
     */
    constructor() {
        this._server = new grpc.Server();

        /*
         * TODO this is here to be uniform regarding how HTTP routes are defined, but it should probably be
         *      configured later or somewhere else
         */
        for (const [protoName, implementations] of Object.entries(servicesImplementationsMappings)) {
            const proto = grpc.loadPackageDefinition(protoLoader.loadSync(
                `${PROTO_DIR}/${protoName}.proto`,
                getLoaderOptions(PROTO_DIR),
            )).o2.bookkeeping;

            // Extract all the messages defined in the proto, if we need to parse nested messages
            const absoluteMessagesDefinitions = extractAbsoluteMessageDefinitions(proto);

            implementations.forEach(({ service, implementation }) => {
                const serviceDefinition = service(proto);
                this._addServiceImplementation(serviceDefinition.service, implementation, absoluteMessagesDefinitions);
            });
        }
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * Start the server
     *
     * @param {string} origin the address and port to which one server will listen to
     * @return {Promise<void>} a promise that resolve when the server has started
     */
    listen(origin) {
        return new Promise((resolve) => this._server.bindAsync(
            origin,
            grpc.ServerCredentials.createInsecure(),
            () => {
                this._server.start();
                resolve();
            },
        ));
    }

    /**
     * Add a gRPC service implementation for a given service definition
     *
     * @param {Object} definition service definition
     * @param {Object} implementation service implementation
     * @param {Object} messagesDefinitions the map of each message definitions and their nested definitions recursively
     * @return {void}
     * @private
     */
    _addServiceImplementation(definition, implementation, messagesDefinitions) {
        this._server.addService(
            definition,
            bindGRPCController(definition, implementation, messagesDefinitions),
        );
    }
}

exports.GRPCServer = GRPCServer;

exports.getLoaderOptions = getLoaderOptions;
