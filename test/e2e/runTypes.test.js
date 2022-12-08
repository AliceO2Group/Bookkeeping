/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */
const chai = require('chai');
const request = require('supertest');
const { server } = require('../../lib/application');

const { expect } = chai;

module.exports = () => {
    describe('GET /api/runTypes', () => {
        it('should return an array', (done) => {
            request(server)
                .get('/api/runTypes')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    expect(res.body.data).to.be.an('array');

                    done();
                });
        });
        it('should support pagination, offset 0 and limit 1', (done) => {
            request(server)
                .get('/api/runTypes?page[offset]=0&page[limit]=1')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    expect(res.body.data).to.have.lengthOf(1);
                    done();
                });
        });
    });
    describe('GET /api/runTypes/:runTypeId', () => {
        it('should return 200 in all other cases', (done) => {
            request(server)
                .get('/api/runTypes/1')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    expect(res.body.data.id).to.equal(1);

                    done();
                });
        });

        it('should return 400 if the run id is not positive', (done) => {
            request(server)
                .get('/api/runTypes/-1')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((error) => error.source.pointer === '/data/attributes/params/runTypeId');
                    expect(titleError.detail).to.equal('"params.runTypeId" must be a positive number');

                    done();
                });
        });
    });
};
