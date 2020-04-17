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
const chai = require('chai');
const request = require('supertest');
const chaiResponseValidator = require('chai-openapi-response-validator');

const { expect } = chai;

chai.use(chaiResponseValidator(path.resolve(__dirname, '..', '..', 'spec', 'openapi.yaml')));

describe('GET /api/', () => {
    let app;

    before(async () => {
        app = require('./../lib/server');
        await app.listen();
    });

    after(async () => {
        await app.close();
    });

    it('should satisfy OpenAPI spec', (done) => {
        request(app)
            .get('/api/')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);

                expect(res).to.satisfyApiSpec;
                done();
            });
    });
});
