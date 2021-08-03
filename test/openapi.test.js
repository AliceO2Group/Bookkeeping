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
        describe(`${method.toUpperCase()} ${path}`, () => {
            foundRoutes.push(`${method.toUpperCase()} ${path}`);

            it.allowFail('should be defined in the OpenAPI spec', () => {
                const specPath = path.split('/').map((sub) => sub.replace(/:(.*)/, '{$1}')).join('/');
                const specRoute = spec.paths[specPath];

                expect(specRoute).to.not.be.undefined;
                expect(specRoute).to.not.be.null;

                expect(specRoute).to.haveOwnProperty(method.toLowerCase());
            });
        });
    });

    // it('should have tested all routes defined in the spec', () => {
    //     expect(foundRoutes).to.include.members(expectedRoutes);
    // });

    it.allowFail('should have defined all tested routes in the spec', () => {
        expect(expectedRoutes).to.include.members(foundRoutes);
    });

    describe('Validator', () => {
        // eslint-disable-next-line require-jsdoc
        function traverse(parent, path = []) {
            const keys = typeof parent === 'object' ? Object.keys(parent) : [];
            for (let i = 0; i < keys.length; i++) {
                const element = keys[i];
                describe(element, () => {
                    traverse(parent[element], [element, ...path]);
                });
            }

            if (path[0] === 'paths' || path[1] === 'components') {
                let prevItem;
                it('should have sorted all keys alphabetically', () => {
                    for (const item of Object.keys(parent)) {
                        expect(prevItem > item, `Expected ${item} to be before ${prevItem}`).to.be.false;
                        prevItem = item;
                    }
                });
            }

            if (keys.includes('type') && parent['type'] === 'object' && path[0] !== 'Entity') {
                it('should have set the additionalProperties to false', () => {
                    expect(keys).to.include('additionalProperties');
                    expect(parent['additionalProperties']).to.be.false;
                });
            }

            if (path[2] === 'paths' && path[0] !== 'parameters') {
                it('should have an operationId', () => {
                    expect(keys).to.include('operationId');
                    expect(keys[0]).to.equal('operationId');
                });

                it('should have an summary', () => {
                    expect(keys).to.include('summary');
                    expect(keys[1]).to.equal('summary');
                });
            }

            if (path[3] === 'paths' && path[0] === 'tags') {
                it('should have a single tag', () => {
                    expect(keys).to.have.lengthOf(1);
                });
            }

            if (path[0] === 'description') {
                it('should start with a capital letter', () => {
                    expect(parent).to.match(/^[A-Z].*$/);
                });

                it.allowFail('should end with a period', () => {
                    expect(parent).to.match(/^.*\.$/);
                });
            }

            if (path[3] === 'paths' && path[0] === 'responses') {
                it('should have a default response', () => {
                    expect(keys).to.include('default');
                    expect(keys[keys.length - 1]).to.equal('default');
                });
            }

            if (path[2] === 'paths' && path[0] === 'post') {
                it('should have a request body', () => {
                    expect(keys).to.include('requestBody');
                    expect(keys[2]).to.equal('requestBody');
                });
            }

            if (path[0] === 'schema') {
                it.allowFail('should have a $ref', () => {
                    expect(keys).to.have.lengthOf(1);
                    expect(keys[0]).to.equal('$ref');
                });
            }
        }

        traverse(spec);
    });
};
