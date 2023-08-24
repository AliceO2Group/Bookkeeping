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
    try {
        for (const { path, name, toJs } of requestFieldsConverters) {
            let subject = request;
            for (const pathPart of path) {
                subject = (subject || [])[pathPart];
            }
            if (subject) {
                const grpcValue = subject[name];
                subject[name] = toJs(grpcValue);
            }
        }

        const response = await methodImplementation(request);

        if (!response) {
            throw new Error(`Controller for ${methodPath} returned a null response`);
        }

        // Convert values to enums for response
        for (const { path, name, fromJs } of responseFieldsConverters) {
            let subject = response;
            for (const pathPart of path) {
                subject = (subject || [])[pathPart];
            }
            if (subject) {
                const jsValue = subject[name];
                subject[name] = fromJs(jsValue);
            }
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
        const requestEnumsPaths = extractFieldsConverters(requestType.type, absoluteMessagesDefinitions);
        const responseEnumsPaths = extractFieldsConverters(responseType.type, absoluteMessagesDefinitions);

        adapter[methodName] = getMethodAdapter(implementation[methodName].bind(implementation), requestEnumsPaths, responseEnumsPaths, path);
    }

    return adapter;
};

exports.bindGRPCController = bindGRPCController;
