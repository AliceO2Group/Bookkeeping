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
const { server } = require('../../lib/application');

const { expect } = chai;

chai.use(chaiResponseValidator(path.resolve(__dirname, '..', '..', 'spec', 'openapi.yaml')));

module.exports = () => {
    describe('PATCH /api/runs/:runNumber/detector/:detectorId ', () => {
        it('should return 400 when detectorId is wrong', (done) => {
            request(server)
                .patch('/api/runs/106/detectors/9999999')
                .send({
                    quality: 'none',
                })
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;
                    expect(res.body.errors[0].detail)
                        .to
                        .equal('This run\'s detector with runNumber: (106) and with detector Id: (9999999) could not be found');
                    done();
                });
        });
        it('should return 200 when the right quality is given', (done) => {
            request(server)
                .patch('/api/runs/106/detectors/1')
                .send({
                    quality: 'wrong',
                })
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;
                    expect(res.body.errors[0].detail).to.equal('"body.quality" must be one of [good, bad, none]');
                    done();
                });
        });
        it('should return 200 when the right quality is given', (done) => {
            request(server)
                .patch('/api/runs/106/detectors/1')
                .send({
                    quality: 'bad',
                })
                .expect(201)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    expect(res.body.data.quality).to.equal('bad');
                    done();
                });
        });
    });
};
