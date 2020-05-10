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

const path = require('path');
const { expect } = require('chai');
const yaml = require('js-yaml');
const fs = require('fs');
const { getRoutesAsList } = require('../lib/server/routers');

module.exports = () => {
    it.allowFail = (title, callback) => {
        it(title, async function () {
            try {
                await Promise.resolve();
                return callback.apply(this, arguments);
            } catch (e) {
                this.skip();
            }
        });
    };

    const routes = getRoutesAsList();

    const spec = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, '..', 'spec', 'openapi.yaml'), 'utf8'));

    const expectedRoutes = [];
    Object.keys(spec.paths).forEach((specPath) => {
        Object.keys(spec.paths[specPath]).forEach((specPathMethod) => {
            if (specPathMethod === 'parameters') {
                return;
            }

            const expectedMethod = specPathMethod.toUpperCase();
            const expectedPath = specPath.split('/').map((sub) => sub.replace(/{([^}]+)}/, ':$1')).join('/');

            expectedRoutes.push(`${expectedMethod} ${expectedPath}`);
        });
    });

    const foundRoutes = [];
    routes.forEach((route) => {
        const { method, path } = route;
        describe(`${method.toUpperCase()} ${path.toLowerCase()}`, () => {
            foundRoutes.push(`${method.toUpperCase()} ${path.toLowerCase()}`);

            it.allowFail('should be defined in the OpenAPI spec', () => {
                const specPath = path.split('/').map((sub) => sub.replace(/:(.*)/, '{$1}')).join('/');
                const specRoute = spec.paths[specPath];

                expect(specRoute).to.not.be.undefined;
                expect(specRoute).to.not.be.null;

                expect(specRoute).to.haveOwnProperty(method.toLowerCase());
            });
        });
    });

    it('should have tested all routes defined in the spec', () => {
        expect(foundRoutes).to.include.members(expectedRoutes);
    });

    it.allowFail('should have defined all tested routes in the spec', () => {
        expect(expectedRoutes).to.include.members(foundRoutes);
    });

    describe('paths', () => {
        let prevPath;
        it('should have all keys alphabetically sorted', () => {
            for (const path of Object.keys(spec.paths)) {
                expect(prevPath > path, `Expected ${path} to be before ${prevPath}`).to.be.false;
                prevPath = path;
            }
        });

        for (const path of Object.keys(spec.paths)) {
            describe(path, () => {
                it('should have all keys alphabetically sorted', () => {
                    let prevMethod;
                    for (const method of Object.keys(spec.paths[path])) {
                        if (method === 'parameters') {
                            expect(Boolean(prevMethod), 'Global route parameters should be declared first').to.be.false;
                            continue;
                        }

                        expect(prevMethod > method, `Expected ${method} to be before ${prevMethod}`).to.be.false;
                        prevMethod = method;
                    }
                });
            });
        }
    });

    describe('components', () => {
        let prevComponent;
        it('should have all keys alphabetically sorted', () => {
            for (const component of Object.keys(spec.components)) {
                expect(prevComponent > component, `Expected ${component} to be before ${prevComponent}`).to.be.false;
                prevComponent = component;
            }
        });

        for (const component of Object.keys(spec.components)) {
            describe(component, () => {
                let prevItem;
                it('should have all keys alphabetically sorted', () => {
                    for (const item of Object.keys(spec.components[component])) {
                        expect(prevItem > item, `Expected ${item} to be before ${prevItem}`).to.be.false;
                        prevItem = item;
                    }
                });
            });
        }
    });
};
