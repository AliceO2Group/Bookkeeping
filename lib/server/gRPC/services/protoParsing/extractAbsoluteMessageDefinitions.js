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
     * @param {Object} type the type to parse for message or nested types
     * @param {string} key the key of the message from which nested definitions may be extracted
     * @return {void}
     */
    const extractNestedDefinitions = (type, key) => {
        // The type is a message if it has field array (even empty)
        if (type.field) {
            definitions.set(key, type);
            for (const nestedType of type.nestedType ?? []) {
                extractNestedDefinitions(nestedType, `${key}.${nestedType.name}`);
            }
        }
    };

    for (const key in proto) {
        const { type } = proto[key];
        if (type) {
            extractNestedDefinitions(type, key);
        }
    }

    return definitions;
};

exports.extractAbsoluteMessageDefinitions = extractAbsoluteMessageDefinitions;
