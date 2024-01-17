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

const { expect } = require('chai');
const request = require('supertest');
const { resetDatabaseContent } = require('../utilities/resetDatabaseContent.js');

module.exports = () => {
    before(resetDatabaseContent);
    const { server } = require('../../lib/application');

    describe('GET /api/environments', () => {
        it('should return 201 if valid data is provided', (done) => {
            request(server)
                .get('/api/environments')
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

        it('should successfully show all environments without filter', async () => {
            const response = await request(server).get('/api/environments');

            expect(response.status).to.equal(200);
            const environments = response.body.data;
            expect(environments).to.lengthOf(9);
            // Check if the environment list is valid by checking the first one only
            expect(environments[0].id).to.equal('CmCvjNbg');
        });

        it('should successfully apply filter for environments ids', async () => {
            const response = await request(server).get('/api/environments?filter[ids]=8E4aZTjY');

            expect(response.status).to.equal(200);
            const environments = response.body.data;
            expect(environments).to.lengthOf(1);
            expect(environments[0].id).to.equal('8E4aZTjY');
        });

        it('should successfully filter environments on a list of ids', async () => {
            const response = await request(server).get('/api/environments?filter[ids]=CmCvjNbg, TDI59So3d, EIDO13i3D');

            expect(response.status).to.equal(200);
            const environments = response.body.data;
            expect(environments).to.lengthOf(3);
            expect(environments[0].id).to.equal('CmCvjNbg');
            expect(environments[1].id).to.equal('TDI59So3d');
            expect(environments[2].id).to.equal('EIDO13i3D');
        });

        it('should successfully filter environments on one current status', async () => {
            const response = await request(server).get('/api/environments?filter[currentStatus]=RUNNING');

            expect(response.status).to.equal(200);
            const environments = response.body.data;
            expect(environments.length).to.be.equal(2);
            expect(environments[0].id).to.be.equal('CmCvjNbg');
            expect(environments[1].id).to.be.equal('Dxi029djX');
        });

        it('should successfully filter environments on multiple current statusses', async () => {
            const response = await request(server).get('/api/environments?filter[currentStatus]=RUNNING, ERROR');

            expect(response.status).to.equal(200);
            const environments = response.body.data;
            expect(environments.length).to.be.equal(4);
            expect(environments[0].id).to.be.equal('CmCvjNbg');
            expect(environments[1].id).to.be.equal('EIDO13i3D');
            expect(environments[2].id).to.be.equal('8E4aZTjY');
            expect(environments[3].id).to.be.equal('Dxi029djX');
        });

        it('should successfully filter environments on status history with - input', async () => {
            const response = await request(server).get('/api/environments?filter[statusHistory]=S-E');

            expect(response.status).to.equal(200);
            const environments = response.body.data;
            expect(environments.length).to.be.equal(2);
            expect(environments[0].id).to.be.equal('EIDO13i3D');
            expect(environments[1].id).to.be.equal('8E4aZTjY');
        });

        it('should successfully filter environments on status history without - input', async () => {
            const response = await request(server).get('/api/environments?filter[statusHistory]=SE');

            expect(response.status).to.equal(200);
            const environments = response.body.data;
            expect(environments.length).to.be.equal(2);
            expect(environments[0].id).to.be.equal('EIDO13i3D');
            expect(environments[1].id).to.be.equal('8E4aZTjY');
        });

        it('should successfully filter environments on status history with equal input with -', async () => {
            const responseWithChar = await request(server).get('/api/environments?filter[statusHistory]=SE');
            const responseWithoutChar = await request(server).get('/api/environments?filter[statusHistory]=S-E');
            const withChar = responseWithChar.body.data;
            const withoutChar = responseWithoutChar.body.data;

            expect(withChar).to.be.an('array');
            expect(withChar.length).to.be.equal(2);
            expect(withoutChar).to.be.an('array');
            expect(withoutChar.length).to.be.equal(2);
            // Results need to be the same
            expect(withChar[0].id).to.be.equal(withoutChar[0].id);
            expect(withChar[1].id).to.be.equal(withoutChar[1].id);
        });

        it('should successfully filter environments on one run number', async () => {
            const response = await request(server).get('/api/environments?filter[runNumbers]=103');

            expect(response.status).to.equal(200);
            const environments = response.body.data;
            expect(environments.length).to.be.equal(1);
            expect(environments[0].id).to.be.equal('TDI59So3d');
        });

        it('should successfully filter environments on multiple run numbers', async () => {
            const response = await request(server).get('/api/environments?filter[runNumbers]=103,96');

            expect(response.status).to.equal(200);
            const environments = response.body.data;
            expect(environments.length).to.be.equal(2);
            expect(environments[0].id).to.be.equal('TDI59So3d');
            expect(environments[1].id).to.be.equal('EIDO13i3D');
        });
    });
    describe('POST /api/environments', () => {
        it('should return 201 if valid data is provided', (done) => {
            request(server)
                .post('/api/environments')
                .expect(201)
                .send({
                    envId: 'New original env',
                    status: 'STANDBY',
                    statusMessage: 'This is going very good',
                })
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data.id).to.equal('New original env');
                    expect(data.status).to.equal('STANDBY');
                    expect(data.statusMessage).to.equal('This is going very good');
                    done();
                });
        });
        it('should return 400 if no id is provided', (done) => {
            request(server)
                .post('/api/environments')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/body/envId');
                    expect(titleError.detail).to.equal('"body.envId" is required');

                    done();
                });
        });
        it('should return 400 if createdAt is no date', (done) => {
            request(server)
                .post('/api/environments')
                .expect(400)
                .send({
                    envId: 'Cake environments',
                    createdAt: 'This is no date',
                })
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/body/createdAt');
                    expect(titleError.detail).to.equal('"body.createdAt" must be a valid date');

                    done();
                });
        });
        it('should return 400 if id already exists', (done) => {
            request(server)
                .post('/api/environments')
                .send({
                    envId: 'Dxi029djX',
                })
                .expect(409)
                .end((err) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    done();
                });
        });
    });
    describe('PUT /api/environment/:envId', () => {
        const toredownDate = new Date().setMilliseconds('0');
        it('should return 400 if the wrong id is provided', (done) => {
            request(server)
                .put('/api/environments/99999')
                .expect(400)
                .end((err) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    done();
                });
        });
        it('should return 201 if valid data is given', (done) => {
            request(server)
                .put('/api/environments/KGIS12DS')
                .send({
                    toredownAt: toredownDate,
                    status: 'DESTROYED',
                    statusMessage: 'This is a good environment.',
                })
                .expect(201)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    expect(res.body.data.status).to.equal('DESTROYED');
                    expect(res.body.data.toredownAt).to.equal(toredownDate);
                    expect(res.body.data.statusMessage).to.equal('This is a good environment.');
                    done();
                });
        });
    });

    describe('GET /api/environments/:envId/logs/', () => {
        it('should successfully return a 200 response containing the logs linked to a given environment', async () => {
            const response = await request(server).get('/api/environments/8E4aZTjY/logs');
            expect(response.status).to.equal(200);
            expect(response.body.data).to.lengthOf(3);
        });
    });
};
