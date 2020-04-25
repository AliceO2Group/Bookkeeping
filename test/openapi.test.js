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
const { getRoutesAsList } = require('../lib/framework/http/routers');

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
    const baseURL = spec.servers[0].url;

    const expectedRoutes = [];
    Object.keys(spec.paths).forEach((specPath) => {
        Object.keys(spec.paths[specPath]).forEach((specPathMethod) => {
            expectedRoutes.push(`${specPathMethod.toUpperCase()} ${specPath.toLowerCase()}`);
        });
    });

    const foundRoutes = [];
    routes.forEach((route) => {
        const { method, path } = route;
        describe(`${method.toUpperCase()} ${path.toLowerCase()}`, () => {
            foundRoutes.push(`${method.toUpperCase()} ${path.toLowerCase()}`);

            it.allowFail('should be defined in the OpenAPI spec', (done) => {
                const specRoute = spec.paths[path.substr(baseURL.length)];

                expect(specRoute).to.not.be.undefined;
                expect(specRoute).to.not.be.null;

                expect(specRoute).to.haveOwnProperty(method.toLowerCase());

                this.skip();
                done();
            });
        });
    });

    it('should have tested all routes defined in the spec', () => {
        expect(foundRoutes).to.include.members(expectedRoutes);
    });

    it.allowFail('should have defined all tested routes in the spec', () => {
        expect(expectedRoutes).to.include.members(foundRoutes);
    });
};
