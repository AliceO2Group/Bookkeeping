/* eslint-disable no-trailing-spaces */
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
const chai = require('chai');
const request = require('supertest');
const chaiResponseValidator = require('chai-openapi-response-validator');

const { expect } = chai;

chai.use(chaiResponseValidator(path.resolve(__dirname, '..', '..', 'spec', 'openapi.yaml')));

module.exports = () => {
    const { server } = require('../../lib/application');

    describe('GET /api/status', () => {
        it('should return up to date gui status', (done) => {
            request(server)
                .get('/api/status/gui')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    expect(res.body.data.status.ok).to.equal(true);
                    done();
                });
        });
        it('should return up to date server status', (done) => {
            request(server)
                .get('/api/status/database')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    
                    expect(res.body.data.status.ok).to.equal(true);
                    done();
                });
        });
    });
};
