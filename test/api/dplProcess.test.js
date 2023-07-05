/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

const { resetDatabaseContent } = require('../utilities/resetDatabaseContent.js');
const request = require('supertest');
const { server } = require('../../lib/application');
const { expect } = require('chai');
const { buildUrl } = require('../../lib/utilities/buildUrl.js');

module.exports = () => {
    before(resetDatabaseContent);

    describe('GET /api/dpl-process/detectors', async () => {
        it('Should successfully return the list of detectors that have at least one executed process for the given run', async () => {
            const response = await request(server).get(buildUrl('/api/dpl-process/detectors', { runNumber: 106 }));

            await new Promise((res) => setTimeout(res, 20));
            expect(response.status).to.equal(200);
            expect(response.body.data).to.be.an('array');
            expect(response.body.data.map(({ id }) => parseInt(id, 10))).to.eql([1, 2]);
        });

        it('Should successfully return a 404 when trying to get detectors with a non-existing run number', async () => {
            const response = await request(server).get(buildUrl('/api/dpl-process/detectors', { runNumber: 999 }));

            expect(response.status).to.equal(404);
        });

        it('Should successfully return a 400 when trying to get detectors with an invalid run number', async () => {
            const response = await request(server).get(buildUrl('/api/dpl-process/detectors', { runNumber: 'not-a-number' }));

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('"query.runNumber" must be a number');
        });

        it('Should successfully return a 400 when trying to get detectors without run number', async () => {
            const response = await request(server).get('/api/dpl-process/detectors');

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('"query.runNumber" is required');
        });
    });

    describe('GET /api/dpl-process/processes', async () => {
        it('Should successfully return the list of processes executed at least once for the given run and detector', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/processes',
                    {
                        runNumber: 106,
                        detectorId: 1,
                    },
                ));

            expect(response.status).to.equal(200);
            expect(response.body.data).to.be.an('array');
            expect(response.body.data.map(({ id }) => parseInt(id, 10))).to.eql([1, 2, 3]);
        });

        it('Should successfully return a 404 when trying to get processes with a non-existing run number', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/processes',
                    {
                        runNumber: 999,
                        detectorId: 1,
                    },
                ));

            expect(response.status).to.equal(404);
        });

        it('Should successfully return a 400 when trying to get processes with an invalid run number', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/processes',
                    {
                        runNumber: 'not-a-number',
                        detectorId: 1,
                    },
                ));

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('"query.runNumber" must be a number');
        });

        it('Should successfully return a 400 when trying to get processes without run number', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/processes',
                    {
                        detectorId: 1,
                    },
                ));

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('"query.runNumber" is required');
        });

        it('Should successfully return a 404 when trying to get processes with a non-existing detector id', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/processes',
                    {
                        runNumber: 106,
                        detectorId: 999,
                    },
                ));

            expect(response.status).to.equal(404);
        });

        it('Should successfully return a 400 when trying to get processes with an invalid detector id', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/processes',
                    {
                        runNumber: 106,
                        detectorId: 'not-a-number',
                    },
                ));

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('"query.detectorId" must be a number');
        });

        it('Should successfully return a 400 when trying to get processes without detector id', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/processes',
                    {
                        runNumber: 106,
                    },
                ));

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('"query.detectorId" is required');
        });
    });

    describe('GET /api/dpl-process/hosts', async () => {
        it('Should successfully return the list of hosts on which a given process has been executed for a given run and detector', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/hosts',
                    {
                        runNumber: 106,
                        detectorId: 1,
                        processId: 1,
                    },
                ));

            expect(response.status).to.equal(200);
            expect(response.body.data).to.be.an('array');
            expect(response.body.data.map(({ id }) => parseInt(id, 10))).to.eql([1, 2]);
        });

        it('Should successfully return a 404 when trying to get hosts for non-existing run', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/hosts',
                    {
                        runNumber: 999,
                        detectorId: 1,
                        processId: 1,
                    },
                ));

            expect(response.status).to.equal(404);
        });

        it('Should successfully return a 400 when trying to get hosts with an invalid run number', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/hosts',
                    {
                        runNumber: 'not-a-number',
                        detectorId: 1,
                        processId: 1,
                    },
                ));

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('"query.runNumber" must be a number');
        });

        it('Should successfully return a 400 when trying to get hosts without run number', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/hosts',
                    {
                        detectorId: 1,
                        processId: 1,
                    },
                ));

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('"query.runNumber" is required');
        });

        it('Should successfully return a 404 when trying to get hosts for non-existing detector', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/hosts',
                    {
                        runNumber: 106,
                        detectorId: 999,
                        processId: 1,
                    },
                ));

            expect(response.status).to.equal(404);
        });

        it('Should successfully return a 400 when trying to get hosts with an invalid detector id', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/hosts',
                    {
                        runNumber: 106,
                        detectorId: 'not-a-number',
                        processId: 1,
                    },
                ));

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('"query.detectorId" must be a number');
        });

        it('Should successfully return a 400 when trying to get hosts without detector id', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/hosts',
                    {
                        runNumber: 106,
                        processId: 1,
                    },
                ));

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('"query.detectorId" is required');
        });

        it('Should successfully return a 404 when trying to get hosts for non-existing process', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/hosts',
                    {
                        runNumber: 106,
                        detectorId: 1,
                        processId: 999,
                    },
                ));

            expect(response.status).to.equal(404);
        });

        it('Should successfully return a 400 when trying to get hosts with an invalid process id', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/hosts',
                    {
                        runNumber: 106,
                        detectorId: 1,
                        processId: 'not-a-number',
                    },
                ));

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('"query.processId" must be a number');
        });

        it('Should successfully return a 400 when trying to get hosts without process id', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/hosts',
                    {
                        runNumber: 106,
                        detectorId: 1,
                    },
                ));

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('"query.processId" is required');
        });
    });

    describe('GET /api/dpl-process/executions', async () => {
        it('Should successfully return the executions of a given process on a given hosts for a given run and detector', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/executions',
                    {
                        runNumber: 106,
                        detectorId: 1,
                        processId: 1,
                        hostId: 1,
                    },
                ));

            expect(response.status).to.equal(200);
            expect(response.body.data).to.be.an('array');
            expect(response.body.data.map(({ id }) => parseInt(id, 10))).to.eql([2]);
        });

        it('Should successfully return a 404 when trying to get process executions for non-existing run', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/executions',
                    {
                        runNumber: 999,
                        detectorId: 1,
                        processId: 1,
                        hostId: 1,
                    },
                ));

            expect(response.status).to.equal(404);
        });

        it('Should successfully return a 400 when trying to get process executions with an invalid run number', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/executions',
                    {
                        runNumber: 'not-a-number',
                        detectorId: 1,
                        processId: 1,
                        hostId: 1,
                    },
                ));

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('"query.runNumber" must be a number');
        });

        it('Should successfully return a 400 when trying to get process executions without run number', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/executions',
                    {
                        detectorId: 1,
                        processId: 1,
                        hostId: 1,
                    },
                ));

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('"query.runNumber" is required');
        });

        it('Should successfully return a 404 when trying to get process executions for non-existing detector', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/executions',
                    {
                        runNumber: 106,
                        detectorId: 999,
                        processId: 1,
                        hostId: 1,
                    },
                ));

            expect(response.status).to.equal(404);
        });

        it('Should successfully return a 400 when trying to get process executions with an invalid detector id', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/executions',
                    {
                        runNumber: 106,
                        detectorId: 'not-a-number',
                        processId: 1,
                    },
                ));

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('"query.detectorId" must be a number');
        });

        it('Should successfully return a 400 when trying to get process executions without detector id', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/executions',
                    {
                        runNumber: 106,
                        processId: 1,
                    },
                ));

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('"query.detectorId" is required');
        });

        it('Should successfully return a 404 when trying to get process executions for non-existing process', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/executions',
                    {
                        runNumber: 106,
                        detectorId: 1,
                        processId: 999,
                        hostId: 1,
                    },
                ));

            expect(response.status).to.equal(404);
        });

        it('Should successfully return a 400 when trying to get process executions with an invalid process id', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/executions',
                    {
                        runNumber: 106,
                        detectorId: 1,
                        processId: 'not-a-number',
                    },
                ));

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('"query.processId" must be a number');
        });

        it('Should successfully return a 400 when trying to get process executions without process id', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/executions',
                    {
                        runNumber: 106,
                        detectorId: 1,
                    },
                ));

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('"query.processId" is required');
        });

        it('Should successfully return a 404 when trying to get process executions for non-existing host', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/executions',
                    {
                        runNumber: 106,
                        detectorId: 1,
                        processId: 1,
                        hostId: 999,
                    },
                ));

            expect(response.status).to.equal(404);
        });

        it('Should successfully return a 400 when trying to get process executions with an invalid host id', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/executions',
                    {
                        runNumber: 106,
                        detectorId: 1,
                        processId: 1,
                        hostId: 'not-a-number',
                    },
                ));

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('"query.hostId" must be a number');
        });

        it('Should successfully return a 400 when trying to get process executions without host id', async () => {
            const response = await request(server)
                .get(buildUrl(
                    '/api/dpl-process/executions',
                    {
                        runNumber: 106,
                        detectorId: 1,
                        processId: 1,
                    },
                ));

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('"query.hostId" is required');
        });
    });
};
