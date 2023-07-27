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

const { fromGRPCEnum, toGRPCEnum } = require('../enumConverter/gRPCEnumValueConverter.js');
const { longToBigInt, bigIntToLong } = require('../../../utilities/bigIntConverter.js');
const { Long } = require('@grpc/proto-loader');

/**
 * Extract the definition of a message from the map of absolute message definitions, considering a given context (i.e. a certain level inside
 * nested messages)
 *
 * For example if context is [A, B, C] and we look for D, we will successively look for A.B.C.D (message definition in the current message),
 * then for A.B.D (message definition in the parent message), then for A.D and finally for D. If D is not found, an error is thrown
 *
 * @param {string} messageName the name of the message to look for definition
 * @param {string[]} context the list of types names of all the parent messages of the current field
 * @param {Map<string, Object>} absoluteMessageDefinitions the absolute messages definitions
 * @return {object} the message definition
 */
const getCloserMessageDefinition = (messageName, context, absoluteMessageDefinitions) => {
    // Look for the message definition, from the deepest definition to the more general one
    const searchContext = [...context];
    for (let depth = context.length; depth >= 0; depth--) {
        const prefix = searchContext.join('.');
        const absoluteMessageName = prefix ? `${prefix}.${messageName}` : messageName;
        const definition = absoluteMessageDefinitions.get(absoluteMessageName);
        if (definition) {
            return definition;
        }
        searchContext.shift();
    }
    throw Error(`Message definition not found ${messageName} from context ${context.join('.')}`);
};

/**
 * @typedef FieldConverter
 *
 * Define how to convert a field defined by its path (recursive field names from root message to get to the actual field) from/to js to/from
 *     gRPC values
 *
 * For example in a message having a property `a` being a message of type `A`, and the message A having a property `b` of the enum `EnumB`, the
 *     path will be `['a'], the name will be 'b' and the converter will store how to convert from this enum value to js and the other way around
 *
 * @property {string[]} path array containing the list of fields from the root message up to the field's parent message
 * @property {string} name the name of the field relatively to its direct parent message
 * @property {function} toJs function called with the gRPC value to convert it to JS value
 * @property {function} fromJs function called with the JS value to convert it to gRPC value
 */

/**
 * Extract the list of all the fields that need a conversion between their js value and their gRPC value
 *
 * @param {object} typeDefinition the protobuf type to look for convertible fields
 * @param {Map<string, object>} absoluteMessageDefinitions the absolute messages definitions
 * @return {FieldConverter[]} the list of properties path and the corresponding enum name for all the enums found in the given type
 */
const extractFieldsConverters = ({ field, name }, absoluteMessageDefinitions) => {
    /**
     * @type {FieldConverter[]}
     */
    const fieldConverters = [];

    /**
     * Extract recursively the enums path for a given list of fields, considering a root path and a context
     *
     * @param {object[]} fields the list of fields to look for convertible values (messages will be parsed recursively)
     * @param {string[]} path the current path to follow to go to the current level
     * @param {string[]} context the list of types names of all the parent messages of the current field
     * @return {void}
     */
    const extractInnerFieldsConverters = (fields, path, context) => {
        for (const field of fields) {
            const { name, type, typeName } = field;
            switch (type) {
                case 'TYPE_ENUM':
                    // eslint-disable-next-line no-case-declarations
                    const relativeTypeName = typeName.substring(typeName.lastIndexOf('.') + 1);
                    fieldConverters.push({
                        path,
                        name,
                        toJs: (value) => fromGRPCEnum(relativeTypeName, value),
                        fromJs: (value) => toGRPCEnum(relativeTypeName, value),
                    });
                    break;
                case 'TYPE_UINT64':
                    fieldConverters.push({
                        path,
                        name,
                        toJs: (value) => (value ?? null) !== null ? longToBigInt(value) : value,
                        fromJs: (value) => typeof value === 'bigint'
                            ? bigIntToLong(value, true)
                            : typeof value === 'string' ? Long.fromString(value, true, 10) : value,
                    });
                    break;
                case 'TYPE_INT64':
                    fieldConverters.push({
                        path,
                        name,
                        toJs: (value) => (value ?? null) !== null ? longToBigInt(value) : value,
                        fromJs: (value) => (value ?? null) !== null
                            ? bigIntToLong(value, false)
                            : typeof value === 'string' ? Long.fromString(value, false, 10) : value,
                    });
                    break;
                case 'TYPE_MESSAGE':
                    // eslint-disable-next-line no-case-declarations
                    const definition = getCloserMessageDefinition(typeName, context, absoluteMessageDefinitions);
                    extractInnerFieldsConverters(definition.field, [...path, name], [...context, definition.name]);
                    break;
            }
        }
    };

    extractInnerFieldsConverters(field, [], [name]);

    return fieldConverters;
};

exports.extractFieldsConverters = extractFieldsConverters;
