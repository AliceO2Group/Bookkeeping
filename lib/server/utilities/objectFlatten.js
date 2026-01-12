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
 * CreateTemplateObject based on required properties, will all be initialized null.
 * @param {Set} requiredProperties - unique collection of required properties for template object.
 * @param {boolean} reverseObjectPropertiesOrder - reverses the order of the properties on the template object.
 * @returns {object} - template object.
 */
export const createTemplateObject = (requiredProperties, reverseObjectPropertiesOrder = false) => {
    const templateObject = {};
    // Array.toReversed requires Node.js 20 (Release date: 2023-04-18) it creates a clone and does not modify the original array.
    const templateProperties = reverseObjectPropertiesOrder ? Array.from(requiredProperties.values()).toReversed() : requiredProperties;
    templateProperties.forEach((property) => {
        templateObject[property] = undefined;
    });
    return templateObject;
};

/**
 * ObjectsFlattener
 * @param {object} object - The object to flatten.
 * @param {object} templateObject - Template object to clone and edit with our own properties.
 * @param {boolean} reverseObjectArray - reverses the order of the resulting array of flat objects.
 * @returns {object[]} - flattened object collection.
 */
export const objectsFlattener = (object, templateObject, reverseObjectArray) => {
    const result = objectsFlattenerRecursive(object, templateObject);
    return reverseObjectArray ? result.toReversed() : result;
};

/**
 * Flatten objects recursively
 * @param {object} object - The object to flatten.
 * @param {object} templateObject - Template object to clone and edit with our own properties.
 * @param {string} prefix - String (Optional)  The prefix to add before each key, also used for recursion (E.G object.statistics.total = 1).
 * @param {object[]} result - Array containing flat objects.
 * @returns {object[]} - flattened object collection.
 */
const objectsFlattenerRecursive = (object, templateObject, prefix = '', result = []) => {
    const objectToAdd = { ...templateObject };
    // Track if the template clone has been editted.
    let propertiesAdded = false;
    // Prevent the array index numbers from appearing in the key's of the objects
    const isArray = Array.isArray(object) ? true : false;
    for (const property in object) {
        /**
         * Replace with Object.hasOwn() once https://github.com/AliceO2Group/WebUi/tree/dev/Framework#minimum-browser-version-support
         * Safari minmum version >= 15.4
         */
        if (Object.prototype.hasOwnProperty.call(object, property)) {
            // Only recurse on true objects and arrays, ignore custom classes like dates
            if (typeof object[property] === 'object' && (Array.isArray(object[property])
                || Object.prototype.toString.call(object[property]) === '[object Object]') && object[property] !== null) {
                // Recursion on deeper objects
                if (prefix === '') {
                    isArray ? objectsFlattenerRecursive(object[property], templateObject, `${prefix}`, result)
                        : objectsFlattenerRecursive(object[property], templateObject, `${property}`, result);
                } else {
                    isArray ? objectsFlattenerRecursive(object[property], templateObject, `${prefix}`, result)
                        : objectsFlattenerRecursive(object[property], templateObject, `${prefix}.${property}`, result);
                }
            } else {
                // Regular property
                if (prefix === '') {
                    objectToAdd[`${property}`] = object[property];
                    propertiesAdded = true;
                } else {
                    objectToAdd[`${prefix}.${property}`] = object[property];
                    propertiesAdded = true;
                }
            }
        }
    }
    // Only add template object if it has been editted.
    if (propertiesAdded) {
        result.push(objectToAdd);
    }

    // Return result for next recursion or final result.
    return result;
};

/**
 * Create set of unique headers for a set to later use and create objects with
 * @param {object} object - The object to collect headers from.
 * @param {string} prefix - String (Optional)  The prefix to add before each key, also used for recursion (E.G object.statistics.total = 1).
 * @param {set | null} headerSet - Set of unique header for recursion.
 * @returns {set<string>} - flattened object.
 */
export const headerCollection = (object, prefix = '', headerSet = null) => {
    /*
     * We must build the headers by collecting all possible unique object values.
     * track unique headers/keys
     */
    headerSet = headerSet || new Set();
    // We can add the unique headers to all objects later if they don't exist yet.
    const isArray = Array.isArray(object) ? true : false;

    for (const property in object) {
        /**
         * Replace with Object.hasOwn() once https://github.com/AliceO2Group/WebUi/tree/dev/Framework#minimum-browser-version-support
         * Safari minmum version >= 15.4
         */
        if (Object.prototype.hasOwnProperty.call(object, property)) {
            // Only recurse on true objects and arrays, ignore custom classes like dates
            if (typeof object[property] === 'object' && (Array.isArray(object[property])
                || Object.prototype.toString.call(object[property]) === '[object Object]') && object[property] !== null) {
                // Recursion on deeper objects
                if (prefix === '') {
                    isArray ? headerCollection(object[property], `${prefix}`, headerSet)
                        : headerCollection(object[property], `${property}`, headerSet);
                } else {
                    isArray ? headerCollection(object[property], `${prefix}`, headerSet)
                        : headerCollection(object[property], `${prefix}.${property}`, headerSet);
                }
            } else {
                // Add property to Set.
                if (prefix === '') {
                    headerSet.add(property);
                } else {
                    headerSet.add(`${prefix}.${property}`);
                }
            }
        }
    }
    return headerSet;
};
