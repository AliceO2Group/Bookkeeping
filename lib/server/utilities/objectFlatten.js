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

import { unpackNumberRange } from '../../utilities/rangeUtils.js';

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
    // let returnValue = reverseObjectArray ? result.toReversed() : result;
    console.log('calculating the reverse values');
    const returnValue = reverseArray(result, 'REVERSEMARKER');

    // console.log(returnValue);
    // Reverse result due to recursion.
    return returnValue.reverse();
};

/**
 * Flatten objects recursively
 * @param {object} object - The object to flatten.
 * @param {object} templateObject - Template object to clone and edit with our own properties.
 * @param {string} prefix - String (Optional)  The prefix to add before each key, also used for recursion (E.G object.statistics.total = 1).
 * @param {object[]} result - Array containing flat objects.
 * @param {boolean} markReverse - a boolean that indicates to write an additional property in this object, to mark order needs to be reversed.
 * @returns {object[]} - flattened object collection.
 */
const objectsFlattenerRecursive = (object, templateObject, prefix = '', result = [], markReverse = false) => {
    const objectToAdd = { ...templateObject };
    // Track if the template clone has been editted.
    let propertiesAdded = false;
    // Prevent the array index numbers from appearing in the key's of the objects
    const isArray = Array.isArray(object) ? true : false;

    for (const property in object) {
        /**
         * Replace with Object.hasOwn() once https://github.com/AliceO2Group/WebUi/tree/dev/Framework#minimum-browser-version-support
         * Safari minmum version >= 15.4
         * Property is of its own and not from prototype chain/inherited
         */
        if (Object.prototype.hasOwnProperty.call(object, property)) {
            // Only recurse on true objects and arrays, ignore custom classes like dates
            if (typeof object[property] === 'object' && (Array.isArray(object[property])
                || Object.prototype.toString.call(object[property]) === '[object Object]') && object[property] !== null) {
                // Recursion on deeper objects
                // If prefix === '', it will be the first run/level deep.
                if (prefix === '') {
                    if (isArray) {
                        objectsFlattenerRecursive(object[property], templateObject, `${prefix}`, result, true);
                    } else {
                        objectsFlattenerRecursive(object[property], templateObject, `${property}`, result, false);
                    }
                } else {
                    if (isArray) {
                        objectsFlattenerRecursive(object[property], templateObject, `${prefix}`, result, true);
                    } else {
                        objectsFlattenerRecursive(object[property], templateObject, `${prefix}.${property}`, result, false);
                    }
                }
            } else {
                // Regular property
                if (prefix === '') {
                    objectToAdd[`${property}`] = object[property];
                    objectToAdd['REVERSEMARKER'] = false;
                    propertiesAdded = true;
                } else {
                    objectToAdd[`${prefix}.${property}`] = object[property];
                    objectToAdd['REVERSEMARKER'] = markReverse;
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
 * Reverse parent child collection collections...
 * Create a reverse collection in groups of parent childs objects.
 * @param {object[]} parentCollection - flat object array.
 * @param {string} identifier - property to identify Parent objects with. Child objects should have undefined value.
 * @returns {object[]} reversed parent child collection.
 */
export const reverseArray = (parentCollection, identifier = 'REVERSEMARKER') => {
    const indexes = [];
    let startAddIndex = 0;
    let endAddIndex = 0;
    let queuedAddition = false;

    console.log(`Parent collection size pre = ${parentCollection.length}`);

    // Loop over parentCollection
    for (let i = 0; i < parentCollection.length; i++) {
        // Check for identifier.
        if (parentCollection[i][identifier] === true) {
            console.log(`Will need to be added index: ${i}`);
            // Only change startvalue if this is the beginning of an addition
            if (!queuedAddition) {
                console.log(`setting startvalue: ${i}`);
                startAddIndex = i;
            }
            console.log(`setting endvalue: ${i}`);
            endAddIndex = i;
            queuedAddition = true;
        } else {
            // Values are prepared to be added
            if (queuedAddition) {
                console.log(`pushing the following start/end: s:${startAddIndex} e: ${endAddIndex}`);
                indexes.push([startAddIndex, endAddIndex]);
                queuedAddition = false;
            }
        }
    }
    // In case the last item was marked...
    if (queuedAddition) {
        console.log(`pushing LAST the following start/end: s:${startAddIndex} e: ${endAddIndex}`);
        indexes.push([startAddIndex, endAddIndex]);
        queuedAddition = false;
    }

    console.log(`Collected indexes PRE reverse order = ${indexes[0]}`);
    console.log(`Collected indexes PRE reverse order = ${indexes[1]}`);
    console.log(`Collected indexes PRE reverse order = ${indexes[2]}`);
    console.log(`Collected indexes in right order = ${indexes.toString()}`);
    // Loop over ranges to be switched around
    indexes.forEach((beginAndEndIndex) => {
        let [start, end] = beginAndEndIndex;
        end ++;
        console.log(`To reverse start: ${start}`);
        console.log(`To reverse end: ${end}`);

        const endCount = end - start;
        console.log(`endcount = ${endCount}`);
        if (endCount > 0) {
            parentCollection.splice(start, endCount, ...parentCollection.slice(start, end).toReversed());
        }
    });

    return parentCollection;
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
