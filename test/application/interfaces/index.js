/**
 * This file is part of the ALICE Electronic Logbook v2, also known as Jiskefet.
 * Copyright (C) 2020  Stichting Hogeschool van Amsterdam
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const fs = require('fs');
const path = require('path');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    const useCasesPath = path.resolve(__dirname, '..', '..', '..', 'lib', 'application', 'interfaces');
    getAllFiles(useCasesPath).forEach((file) => {
        if (!file.endsWith('.js') || file.endsWith('index.js')) return;

        const relativePath = path.relative(useCasesPath, file);
        const testName = relativePath.toString().substr(0, relativePath.toString().length - 3);
        describe(testName, () => {
            const clazz = require(file);

            getAllFuncs(clazz.prototype).forEach((method) => {
                if (method === 'constructor') return;

                describe(method, () => {
                    const instance = new clazz();
                    const expected = 'The method or operation is not implemented.';

                    const callable = instance[method];
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

/* eslint-disable */
function getAllFuncs(toCheck) {
    var props = [];
    var obj = toCheck;
    do {
        if (obj.constructor.name !== 'Object') {
            props = props.concat(Object.getOwnPropertyNames(obj));
        }
    } while (obj = Object.getPrototypeOf(obj));

    return props.sort().filter((e, i, arr) => {
        if (e != arr[i + 1] && typeof toCheck[e] == 'function') return true;
    });
}

function getAllFiles(basePath, found = []) {
    fs.readdirSync(basePath).forEach((file) => {
        if (fs.lstatSync(path.resolve(basePath, file)).isDirectory()) {
            found = getAllFiles(path.resolve(basePath, file), found);
        } else {
            found.push(path.resolve(basePath, file));
        }
    });

    return found;
}
/* eslint-enable */
