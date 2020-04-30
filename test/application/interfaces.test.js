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

const fs = require('fs');
const path = require('path');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    const useCasesPath = path.resolve(__dirname, '..', '..', 'lib', 'application', 'interfaces');
    getAllFiles(useCasesPath).forEach((file) => {
        if (!file.endsWith('.js') || file.endsWith('index.js')) {
            return;
        }

        const relativePath = path.relative(useCasesPath, file);
        const testName = relativePath.toString().substr(0, relativePath.toString().length - 3);
        describe(testName, () => {
            const clazz = require(file);

            getAllFunctions(clazz).forEach((method) => {
                if (method === 'constructor') {
                    return;
                }

                describe(method, () => {
                    const instance = new clazz();
                    const expected = 'The method or operation is not implemented.';

                    const callable = instance[method] || clazz[method];
                    if (callable.constructor.name === 'AsyncFunction') {
                        it('should return a rejected Promise', () => callable()
                            .then(() => expect.fail())
                            .catch((err) => expect(err).to.equal(expected)));
                    } else {
                        it('should return an Error', () => {
                            try {
                                callable();
                                expect.fail();
                            } catch (error) {
                                expect(error).to.be.an('Error');
                                expect(error).to.haveOwnProperty('message');
                                expect(error.message).to.equal(expected);
                            }
                        });
                    }
                });
            });
        });
    });
};

/**
 * Returns an array of all instance and static functions, includes inherited.
 *
 * @param {Object} toCheck Object to get all functions from.
 * @returns {String[]} Array of function names.
 */
const getAllFunctions = (toCheck) => {
    let props = [];

    props = props.concat(getAllInstanceFunctions(toCheck));
    props = props.concat(getAllStaticFunctions(toCheck));

    return props.sort();
};

/**
 * Returns an array of all static functions, includes inherited.
 *
 * @param {Object} toCheck Object to get all static functions from.
 * @returns {String[]} Array of function names.
 */
const getAllStaticFunctions = (toCheck) => {
    let props = [];

    let obj = toCheck;
    do {
        if (obj.constructor.name !== 'Object' && !!obj.name) {
            props = props.concat(Object.getOwnPropertyNames(obj));
        }
    // eslint-disable-next-line no-cond-assign
    } while (obj = Object.getPrototypeOf(obj));

    return props.sort().filter((e, i, arr) => (e != arr[i + 1] && typeof toCheck[e] === 'function'));
};

/**
 * Returns an array of all instance functions, includes inherited.
 *
 * @param {Object} toCheck Object to get all instance functions from.
 * @returns {String[]} Array of function names.
 */
const getAllInstanceFunctions = (toCheck) => {
    let props = [];

    let obj = toCheck.prototype;
    do {
        if (obj.constructor.name !== 'Object') {
            props = props.concat(Object.getOwnPropertyNames(obj));
        }
    // eslint-disable-next-line no-cond-assign
    } while (obj = Object.getPrototypeOf(obj));

    return props.sort().filter((e, i, arr) => (e != arr[i + 1] && typeof toCheck.prototype[e] === 'function'));
};

/**
 * Returns an array of all paths found recursively, starting from the basePath.
 *
 * @param {String} basePath Path from which to start searching from.
 * @param {String[]} found  Array of file paths.
 * @returns {String[]} Array of file paths.
 */
const getAllFiles = (basePath, found = []) => {
    fs.readdirSync(basePath).forEach((file) => {
        if (fs.lstatSync(path.resolve(basePath, file)).isDirectory()) {
            found = getAllFiles(path.resolve(basePath, file), found);
        } else {
            found.push(path.resolve(basePath, file));
        }
    });

    return found;
};
