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

const { nativeToGRPCError } = require('./nativeToGRPCError.js');
const { extractFieldsConverters } = require('./services/protoParsing/extractFieldsConverters.js');
const { ApiRequestLogger } = require('../utilities/ApiRequestLogger.js');
const { ApiProtocols } = require('../../domain/enums/ApiProtocols.js');

const GRPC_STATUS_OK = 0;

const defaultApiRequestLogger = new ApiRequestLogger();

/**
 * Adapt gRPC service method to controller handler
 *
 * The purpose of this function is to convert from gRPC js client world to our application world. For example, gRPC js client uses `long` but in
 * the application we use bigint, so the request object needs to be adapted. The same applies for the response.
 * The function provided by this adapter factory is able to take as parameter the call object (from gRPC js client), will extract the request
 * and adapt it, call the controller handler with the adapted request, adapt the result and return it in order for it to be provided as
 * parameter to gRPC js callback function.
 *
 * @param {Function} controllerHandler the controller handler corresponding to the gRPC service
 * @param {FieldConverter[]} requestFieldsConverters the list of request field converters
 * @param {FieldConverter[]} responseFieldsConverters the list of response field converters
 * @return {Function} the function's adapter
 */
const adaptGrpcServiceMethodToControllerHandler = (
    controllerHandler,
    requestFieldsConverters,
    responseFieldsConverters,
) => async ({ request }) => {
    /**
     * Apply a map function to every nodes of a tree described by their path in the tree
     *
     * For example, considering the tree {a: {b1: 12, b2: 5}} with a mapping of (x) => 2*x applied on path ['a', 'b2']
     * Will update the tree to be: {a: {b1: 12, b2: 10}}
     *
     * @param {object} tree the tree to update (will be updated in place)
     * @param {string[]} leafPath path of the leaf to update in the tree
     * @param {Function} mapFunction the mapping function to apply
     * @return {void}
     */
    const mapTreeLeaves = (tree, leafPath, mapFunction) => {
        if (!tree) {
            return;
        }

        // We are at the end of the path, we have the actual value that need to be mapped
        if (leafPath.length === 1) {
            const [leafName] = leafPath;
            // If leaf do not exist, simply return
            if (leafName in tree) {
                const value = tree[leafName];
                // If leaf is an array of value, apply the map to all of them
                tree[leafName] = Array.isArray(value)
                    ? value.map((item) => mapFunction(item))
                    : mapFunction(tree[leafName]);
            }
            return;
        }

        // Recurse in the tree nodes up to the actual leaf
        const [newRootNodeName, ...newLeafPath] = leafPath;

        // Move forward in the tree
        let newTree = tree[newRootNodeName];

        // Manipulate the new root as if it's an array, to apply map to all the subtrees if it's an array
        if (!Array.isArray(newTree)) {
            newTree = [newTree];
        }

        for (const newTreeItem of newTree) {
            mapTreeLeaves(newTreeItem, newLeafPath, mapFunction);
        }
    };

    // Apply the js converter to all the request parameters that needs it
    for (const { path, toJs } of requestFieldsConverters) {
        mapTreeLeaves(request, path, toJs);
    }

    const response = await controllerHandler(request);

    if (typeof response !== 'object' || response === null) {
        return null;
    }

    // Apply the gRPC converter to all the request parameters that needs it
    for (const { path, fromJs } of responseFieldsConverters) {
        mapTreeLeaves(response, path, fromJs);
    }

    return response;
};

/**
 * Adapt a controller to be used as implementation for a given service definition
 *
 * For the methods of the given controller that match service methods, the controller's method will be used to handle gRPC request, the call's
 * request will be provided as unique parameter when calling controller's function (it will match the request type specified in the proto) and
 * the controller's response will be returned to the caller (waiting for promises if it applies)
 *
 * Enums are converted from gRPC values to js values using {@see fromGRPCEnum} and conversely using {@see toGRPCEnum}
 *
 * @param {Object} serviceDefinition the definition of the service to bind
 * @param {Object} implementation the controller instance to use as implementation
 * @param {Array<Function|{process:Function}>} preProcessors a list of functions (or class containing a `process` function) that need to be run
 *     against the call before the implementation
 * @param {Map<string, Object>} absoluteMessagesDefinitions the absolute messages definitions
 * @param {ApiRequestLogger} [apiRequestLogger] the logger of the calls
 * @return {Object} the adapter to provide as gRPC service implementation
 */
const bindGRPCController = (
    serviceDefinition,
    implementation,
    preProcessors,
    absoluteMessagesDefinitions,
    apiRequestLogger = defaultApiRequestLogger,
) => {
    const serviceImplementations = {};

    for (const [methodName, { requestType, responseType, path }] of Object.entries(serviceDefinition)) {
        const requestFieldsConverters = extractFieldsConverters(requestType.type, absoluteMessagesDefinitions);
        const responseFieldsConverters = extractFieldsConverters(responseType.type, absoluteMessagesDefinitions);

        serviceImplementations[methodName] = async (call, callback) => {
            const stopTimer = apiRequestLogger.startTimer();
            let status = GRPC_STATUS_OK;

            const adapter = adaptGrpcServiceMethodToControllerHandler(
                implementation[methodName].bind(implementation),
                requestFieldsConverters,
                responseFieldsConverters,
            );

            try {
                for (const preProcessor of preProcessors || []) {
                    await (typeof preProcessor === 'function' ? preProcessor(call) : preProcessor.process(call));
                }

                const response = await adapter(call);

                if (response === null) {
                    const error = nativeToGRPCError(new Error(`Controller for ${path} returned an invalid response`));
                    status = error.code;
                    callback(error);
                } else {
                    callback(null, response);
                }
            } catch (error) {
                const grpcError = nativeToGRPCError(error);
                status = grpcError.code;
                callback(grpcError);
            } finally {
                // The request has been converted in place by the adapter, so it is logged the way it has been received by the controller
                apiRequestLogger.log({
                    protocol: ApiProtocols.GRPC,
                    route: path,
                    status,
                    durationMs: stopTimer(),
                    userId: call.identity?.id ?? null,
                    params: call.request,
                });
            }
        };
    }

    return serviceImplementations;
};

exports.bindGRPCController = bindGRPCController;
