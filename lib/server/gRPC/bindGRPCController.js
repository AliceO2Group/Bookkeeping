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
const { fromGRPCEnum, toGRPCEnum } = require('./services/enumConverter/gRPCEnumValueConverter.js');
const { extractEnumsPaths } = require('./services/protoParsing/extractEnumsPaths.js');
const { awaitIfNeeded } = require('../../utilities/awaitIfNeeded.js');

/**
 * Wrap the given implementation in a function that will extract the request from the call, pass it to the implementation while converting its
 * values to js values (i.e. enum values), and return the implementation's result converting the values the other way around
 *
 * @param {function} methodImplementation the implementation to wrap for service method
 * @param {EnumPath[]} requestEnumsPaths the list of enums paths for the request message
 * @param {EnumPath[]} responseEnumsPaths the list of enums paths for the response message
 * @param {string} methodPath the service method path, used to provide explicit debug errors
 * @return {function} the function's adapter, taking the call's request as a parameter and returning the implementation's result
 */
const adaptControllerMethodToServiceImplementation = (
    methodImplementation,
    requestEnumsPaths,
    responseEnumsPaths,
    methodPath,
) => async ({ request }) => {
    // Convert enum values from the request
    for (const { path, property, name } of requestEnumsPaths) {
        let subject = request;
        for (const pathPart of path) {
            subject = (subject || [])[pathPart];
        }
        if (subject) {
            const enumValue = subject[property];
            subject[property] = fromGRPCEnum(name, enumValue);
        }
    }

    const response = await awaitIfNeeded(methodImplementation(request));
    if (!response) {
        throw new Error(`Controller for ${methodPath} returned a null response`);
    }

    // Convert values to enums for response
    for (const { path, property, name } of responseEnumsPaths) {
        let subject = response;
        for (const pathPart of path) {
            subject = (subject || [])[pathPart];
        }
        if (subject) {
            const value = subject[property];
            subject[property] = toGRPCEnum(name, value);
        }
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
 * @param {Array<function|{process:function}>} preProcessors a list of functions (or class containing a `process` function) that need to be run
 *     against the call before the implementation
 * @param {Map<string, Object>} absoluteMessagesDefinitions the absolute messages definitions
 * @return {Object} the adapter to provide as gRPC service implementation
 */
const bindGRPCController = (serviceDefinition, implementation, preProcessors, absoluteMessagesDefinitions) => {
    const serviceImplementation = {};

    for (const [methodName, { requestType, responseType, path }] of Object.entries(serviceDefinition)) {
        const requestEnumsPaths = extractEnumsPaths(requestType.type, absoluteMessagesDefinitions);
        const responseEnumsPaths = extractEnumsPaths(responseType.type, absoluteMessagesDefinitions);

        const adaptedMethod = adaptControllerMethodToServiceImplementation(
            implementation[methodName].bind(implementation),
            requestEnumsPaths,
            responseEnumsPaths,
            path,
        );

        serviceImplementation[methodName] = async (call, callback) => {
            try {
                for (const preProcessor of preProcessors || []) {
                    await awaitIfNeeded(typeof preProcessor === 'function' ? preProcessor(call) : preProcessor.process(call));
                }
                callback(null, await adaptedMethod(call));
            } catch (error) {
                callback(nativeToGRPCError(error));
            }
        };
    }
    return serviceImplementation;
};

exports.bindGRPCController = bindGRPCController;
