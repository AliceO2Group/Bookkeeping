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

/**
 * Extract the definition of a message from the map of absolute message definitions, considering a given context (i.e. a certain level inside
 * nested messages)
 *
 * For example if context is [A, B, C] and we look for D, we will successively look for A.B.C.D (message definition in the current message),
 * then for A.B.D (message definition in the parent message), then for A.D and finally for D. If D is not found, an error is thrown
 *
 * @param {string} messageName the name of the message to look for definition
 * @param {string[]} context the list of nested messages to go to the current level of nesting
 * @param {Map<string, Object>} absoluteMessageDefinitions the absolute messages definitions
 * @return {object} the message definition
 */
const getMessageDefinition = (messageName, context, absoluteMessageDefinitions) => {
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
 * @typedef EnumPath
 *
 * Group an enum path and its name.
 * For example in a message having a property `a` being a message of type `A`, and the message A having a property `b` of the enum `EnumB`, the
 *     path will be `['a', 'b'] and the enum name is `EnumB`
 *
 * @property {string[]} path array containing the properties path of the enum
 * @property {string} name the name of the enum
 */

/**
 * Extract the path of all the enums found recursively in the given type
 *
 * @param {Object} typeDefinition the type to look for enums
 * @param {Map<string, Object>} absoluteMessageDefinitions the absolute messages definitions
 * @return {EnumPath[]} the list of properties path and the corresponding enum name for all the enums found in the given type
 */
const extractEnumsPaths = ({ field, name }, absoluteMessageDefinitions) => {
    /**
     * @type {EnumPath[]}
     */
    const enums = [];

    /**
     * Extract recursively the enums path for a given list of fields, considering a root path and a context
     *
     * @param {Object[]} fields the list of fields to look for enums (messages will be parsed recursively)
     * @param {string[]} rootPath the current path (properties names path) to follow to go to the current level
     * @param {string[]} context the list of nested types names to follow to go to the current level
     * @return {void}
     */
    const extractInnerEnumsPaths = (fields, rootPath, context) => {
        for (const { name: fieldName, type, typeName } of fields) {
            const path = [...rootPath, fieldName];
            // If we have an enum, push it
            if (type === 'TYPE_ENUM') {
                enums.push({
                    path: rootPath,
                    property: fieldName,
                    name: typeName.substring(typeName.lastIndexOf('.') + 1),
                });
            }

            if (type === 'TYPE_MESSAGE') {
                const definition = getMessageDefinition(typeName, context, absoluteMessageDefinitions);
                extractInnerEnumsPaths(definition.field, path, [...context, definition.name]);
            }
        }
    };

    extractInnerEnumsPaths(field, [], [name]);

    return enums;
};

exports.extractEnumsPaths = extractEnumsPaths;
