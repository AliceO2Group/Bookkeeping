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
        const dateValue = new Date('1-1-2021').setHours(0, 0, 0, 0);
        it('should return 400 when runNumber is wrong', (done) => {
            request(server)
                .patch('/api/runs/9999999999')
                .send({
                    timeO2End: dateValue,
                    timeTrgEnd: dateValue,
                })
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;
                    expect(res.body.errors[0].title).to.equal('Run with this run number (9999999999) could not be found');

                    done();
                });
        });
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
                    expect(res.body.errors[0].title).to.equal('Run with this run number (9999999999) could not be found');

                    done();
                });
        });
        it('should return 200 when the right quality is given', (done) => {
            request(server)
                .patch('/api/runs/106/detectors/1')
                .send({
                    quality: 'wrong',
                })
                .expect(409)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;
                    const { body } = res;
                    expect(body.data.lhcPeriod).to.equal(106);
                    expect(body.data.triggerValue).to.equal(1);
                    expect(body.data.odcTopologyFullName).to.equal('default');
                });
        });
        it('should return 200 when the right quality is given', (done) => {
            request(server)
                .patch('/api/runs/106/detectors/1')
                .send({
                    quality: 'wrong',
                })
                .expect(422)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    // Response must satisfy the OpenAPI specification
                    expect(res).to.satisfyApiSpec;
                    const { body } = res;
                    expect(body.data.lhcPeriod).to.equal(106);
                    expect(body.data.triggerValue).to.equal(1);
                    expect(body.data.odcTopologyFullName).to.equal('default');
                });
        });
    });
};
