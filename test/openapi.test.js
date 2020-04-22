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
            }
            catch (e) {
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
