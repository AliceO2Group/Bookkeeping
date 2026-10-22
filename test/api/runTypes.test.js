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
const { expect } = require('chai');
const request = require('supertest');
const { server } = require('../../lib/application');
const { resetDatabaseContent } = require('../utilities/resetDatabaseContent.js');

module.exports = () => {
    before(resetDatabaseContent);

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
                    res.body.data.forEach((runType) => expect(Object.keys(runType)).to.have.members(['id', 'name']));

                    done();
                });
        });
        it('should return all the run types without pagination information', (done) => {
            request(server)
                .get('/api/runTypes')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    expect(res.body.data.length).to.be.greaterThan(2);
                    expect(res.body.meta).to.be.undefined;
                    done();
                });
        });
        it('should return 400 if a pagination parameter is given', (done) => {
            request(server)
                .get('/api/runTypes?page[limit]=1')
                .expect(400)
                .end(done);
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
                    expect(Object.keys(res.body.data)).to.have.members(['id', 'name']);

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
