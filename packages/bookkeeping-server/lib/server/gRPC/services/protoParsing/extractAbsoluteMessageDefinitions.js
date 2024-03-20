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
 * Extract a map containing, for each message of the given proto file, the object type indexed by the message name
 *
 * For nested messages, the name is prefixed by the concatenation of the names of the parents messages. For example if a message A contains a
 * message B, the message B will be indexed by A.B
 *
 * @param {Object} proto the proto definition content
 * @return {Map<string, Object>} the messages map
 */
const extractAbsoluteMessageDefinitions = (proto) => {
    const definitions = new Map();

    /**
     * Recursively loop over each message and extract a map from their name to their definition
     *
     * @param {Array} types the list of types to parse for messages or nested types
     * @param {string} prefix the prefix to apply to type's name in the definitions map
     * @return {void}
     */
    const extractNestedDefinitions = (types, prefix) => {
        for (const type of types) {
            // The type is a message if it has field array (even empty)
            if (type?.field) {
                const key = prefix ? `${prefix}.${type.name}` : type.name;
                definitions.set(key, type);
                extractNestedDefinitions(type?.nestedType || [], key);
            }
        }
    };

    extractNestedDefinitions(Object.values(proto).map(({ type }) => type ?? {}), '');

    return definitions;
};

exports.extractAbsoluteMessageDefinitions = extractAbsoluteMessageDefinitions;
