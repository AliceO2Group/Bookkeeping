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

/**
 * Create the adapter to be used as implementation for a service method
 *
 * @param {function} methodImplementation the implementation to wrap for service method
 * @param {FieldConverter[]} requestFieldsConverters the list of field converters
 * @param {FieldConverter[]} responseFieldsConverters the list of enums paths for the response message
 * @param {string} methodPath the service method path, used to provide explicit debug errors
 * @return {function} the function's adapter
 */
const getMethodAdapter = (
    methodImplementation,
    requestFieldsConverters,
    responseFieldsConverters,
    methodPath,
) => async ({ request }, callback) => {
    /**
     * Apply a map function to every nodes of a tree described by their path in the tree
     *
     * For example, considering the tree {a: {b1: 12, b2: 5}} with a mapping of (x) => 2*x applied on path ['a', 'b2']
     * Will update the tree to be: {a: {b1: 12, b2: 10}}
     *
     * @param {object} tree the tree to update (will be updated in place)
     * @param {string[]} leafPath path of the leaf to update in the tree
     * @param {function} mapFunction the mapping function to apply
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

    try {
        // Apply the js converter to all the request parameters that needs it
        for (const { path, toJs } of requestFieldsConverters) {
            mapTreeLeaves(request, path, toJs);
        }

        const response = await methodImplementation(request);

        if (!response) {
            callback(nativeToGRPCError(new Error(`Controller for ${methodPath} returned a null response`)));
        }

        // Apply the gRPC converter to all the request parameters that needs it
        for (const { path, fromJs } of responseFieldsConverters) {
            mapTreeLeaves(response, path, fromJs);
        }

        callback(null, response);
    } catch (error) {
        callback(nativeToGRPCError(error));
    }
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
 * @param {Map<string, Object>} absoluteMessagesDefinitions the absolute messages definitions
 * @return {Object} the adapter to provide as gRPC service implementation
 */
const bindGRPCController = (serviceDefinition, implementation, absoluteMessagesDefinitions) => {
    const adapter = {};

    for (const [methodName, { requestType, responseType, path }] of Object.entries(serviceDefinition)) {
        const requestFieldsConverters = extractFieldsConverters(requestType.type, absoluteMessagesDefinitions);
        const responseFieldsConverters = extractFieldsConverters(responseType.type, absoluteMessagesDefinitions);

        adapter[methodName] = getMethodAdapter(
            implementation[methodName].bind(implementation),
            requestFieldsConverters,
            responseFieldsConverters,
            path,
        );
    }

    return adapter;
};

exports.bindGRPCController = bindGRPCController;
