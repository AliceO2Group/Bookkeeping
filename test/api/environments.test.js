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
        it('should return 200 if valid data is provided', async () => {
            const response = await request(server).get('/api/environments');
            expect(response.status).to.equal(200);
            expect(response.body.data).to.be.an('array');
        });

        it('should successfully show all environments without filter', async () => {
            const response = await request(server).get('/api/environments');

            expect(response.status).to.equal(200);
            const environments = response.body.data;
            expect(environments).to.lengthOf(9);
            // Check if the environment list is valid by checking the first one only
            expect(environments[0].id).to.equal('CmCvjNbg');
        });

        it('should successfully return environments that were created between two provided dates', async () => {
            const from = new Date('2019-08-09 15:50:00').getTime();
            const to = new Date('2019-08-09 19:00:00').getTime();
            const response = await request(server).get(`/api/environments?filter[created][from]=${from}&filter[created][to]=${to}`);

            expect(response.status).to.equal(200);
            const environments = response.body.data;
            expect(environments).to.lengthOf(2);
            expect(environments[0].id).to.equal('TDI59So3d');
            expect(environments[1].id).to.equal('EIDO13i3D');
        });

        it('should successfully return environments that were created from provided date', async () => {
            const from = new Date('2019-08-09 15:50:00').getTime();
            const response = await request(server).get(`/api/environments?filter[created][from]=${from}`);

            expect(response.status).to.equal(200);
            const environments = response.body.data;
            expect(environments).to.lengthOf(3);
            expect(environments[0].id).to.equal('CmCvjNbg');
            expect(environments[1].id).to.equal('TDI59So3d');
            expect(environments[2].id).to.equal('EIDO13i3D');
        });

        it('should successfully return environments that were created to provided date', async () => {
            const to = new Date('2019-08-09 19:00:00').getTime();
            const response = await request(server).get(`/api/environments?filter[created][to]=${to}`);

            expect(response.status).to.equal(200);
            const environments = response.body.data;
            expect(environments).to.lengthOf(8);
            expect(environments[0].id).to.equal('TDI59So3d');
            expect(environments[1].id).to.equal('EIDO13i3D');
            expect(environments[2].id).to.equal('KGIS12DS');
            expect(environments[3].id).to.equal('VODdsO12d');
            expect(environments[4].id).to.equal('GIDO1jdkD');
            expect(environments[5].id).to.equal('8E4aZTjY');
            expect(environments[6].id).to.equal('Dxi029djX');
            expect(environments[7].id).to.equal('eZF99lH6');
        });

        it('should successfully return no environments for filter not matching', async () => {
            const from = Date.now();
            const response = await request(server).get(`/api/environments?filter[created][from]=${from}`);

            expect(response.status).to.equal(200);
            const environments = response.body.data;
            expect(environments).to.lengthOf(0);
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

        it('should successfully filter environments on multiple current statuses', async () => {
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

        it('should successfully filter environments current status with limit', async () => {
            const response = await request(server).get('/api/environments?filter[currentStatus]=RUNNING, ERROR&page[limit]=2');

            expect(response.status).to.equal(200);
            const environments = response.body.data;
            expect(environments.length).to.be.equal(2);
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

        it('should successfully filter environments on status history with a partial sequence', async () => {
            const response = await request(server).get('/api/environments?filter[statusHistory]=D-E');
            
            expect(response.status).to.equal(200);
            const environments = response.body.data;
            expect(environments.length).to.be.equal(1);
            expect(environments[0].id).to.be.equal('KGIS12DS');
        });

        it('should successfully filter environments status history with limit', async () => {
            const response = await request(server).get('/api/environments?filter[statusHistory]=SE&page[limit]=1');

            expect(response.status).to.equal(200);
            const environments = response.body.data;
            expect(environments.length).to.be.equal(1);
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

        it('should successfully filter environments run numbers with limit', async () => {
            const response = await request(server).get('/api/environments?filter[runNumbers]=103,96&page[limit]=1');

            expect(response.status).to.equal(200);
            const environments = response.body.data;
            expect(environments.length).to.be.equal(1);
        });

        it('should successfully filter environments with substring query on one run number', async () => {
            const response = await request(server).get('/api/environments?filter[runNumbers]=10');

            expect(response.status).to.equal(200);
            const environments = response.body.data;
            expect(environments.length).to.be.equal(2);
            // Should include all environments with run numbers containing the substring 10
            expect(environments[0].id).to.be.equal('TDI59So3d');
            expect(environments[1].id).to.be.equal('Dxi029djX');
        });

        it('should successfully filter environments with query on run number range', async () => {
            const response = await request(server).get('/api/environments?filter[runNumbers]=100-105');

            expect(response.status).to.equal(200);
            const environments = response.body.data;
            expect(environments.length).to.be.equal(2);
            // Should include all environments with run numbers between 100 and 105
            expect(environments[0].id).to.be.equal('TDI59So3d');
            expect(environments[1].id).to.be.equal('Dxi029djX');
        });

        it('should successfully filter environments when run number filter contains empty entries', async () => {
            const response = await request(server).get('/api/environments?filter[runNumbers]=103,,');

            expect(response.status).to.equal(200);
            const environments = response.body.data;
            expect(environments).to.have.lengthOf(1);
            expect(environments[0].id).to.be.equal('TDI59So3d');
        });

        it('should return 400 for an invalid run number range, first number greater than second', async () => {
            const response = await request(server).get('/api/environments?filter[runNumbers]=105-100');

            expect(response.status).to.equal(400);
            const { errors } = response.body;
            const rangeError = errors.find((err) => err.source.pointer === '/data/attributes/query/filter/runNumbers');
            expect(rangeError.detail).to.equal('Invalid range: 105-100');
        });

        it('should return 400 for an invalid run number range, negative start number', async () => {
            const response = await request(server).get('/api/environments?filter[runNumbers]=-100-105');

            expect(response.status).to.equal(400);
            const { errors } = response.body;
            const rangeError = errors.find((err) => err.source.pointer === '/data/attributes/query/filter/runNumbers');
            expect(rangeError.detail).to.equal('Invalid range: -100-105');
        });

        it('should return 400 for an invalid run number range, no start number', async () => {
            const response = await request(server).get('/api/environments?filter[runNumbers]=-105');

            expect(response.status).to.equal(400);
            const { errors } = response.body;
            const rangeError = errors.find((err) => err.source.pointer === '/data/attributes/query/filter/runNumbers');
            expect(rangeError.detail).to.equal('Invalid range: -105');
        });

        it('should successfully filter environments by a key in the raw configuration', async () => {
            const response = await request(server).get('/api/environments?filter[rawConfiguration][key]=hosts');

            expect(response.status).to.equal(200);
            const environments = response.body.data;
            expect(environments.length).to.be.equal(2);
            expect(environments.map(({ id }) => id)).to.include.members(['CmCvjNbg', 'TDI59So3d']);
        });

        it('should return 400 if length of rawConfiguration key exceeds 256 characters', async () => {
            const longKey = 'a'.repeat(257);
            const response = await request(server).get(`/api/environments?filter[rawConfiguration][key]=${longKey}`);

            expect(response.status).to.equal(400);
        });

        it('should return 400 if length of rawConfiguration value exceeds 1000 characters', async () => {
            const longValue = 'a'.repeat(1001);
            const response = await request(server)
                .get(`/api/environments?filter[rawConfiguration][key]=hosts&filter[rawConfiguration][value]=${longValue}`);

            expect(response.status).to.equal(400);
        });

        it('should return the same results when filtering raw configuration value with escaped and plain quotes', async () => {
            // Search with plain quotes: ["fake-flp3"]
            const plainResponse = await request(server)
                .get(`/api/environments?filter[rawConfiguration][key]=hosts&filter[rawConfiguration][value]=${encodeURIComponent('["fake-flp3"]')}`);

            // Search with escaped quotes: [\"fake-flp3\"]
            const escapedResponse = await request(server)
                .get(`/api/environments?filter[rawConfiguration][key]=hosts&filter[rawConfiguration][value]=${encodeURIComponent('[\\"fake-flp3\\"]')}`);

            expect(plainResponse.status).to.equal(200);
            expect(escapedResponse.status).to.equal(200);

            const plainEnvs = plainResponse.body.data;
            const escapedEnvs = escapedResponse.body.data;

            expect(plainEnvs.length).to.be.equal(1);
            expect(plainEnvs[0].id).to.equal('TDI59So3d');

            expect(escapedEnvs.length).to.be.equal(1);
            expect(escapedEnvs[0].id).to.equal('TDI59So3d');
        });

        it('should filter raw configuration value with array brackets and quotes', async () => {
            const response = await request(server)
                .get('/api/environments?filter[rawConfiguration][key]=hosts&filter[rawConfiguration][value]=["fake-flp1", "fake-flp2"]');

            expect(response.status).to.equal(200);
            const environments = response.body.data;
            expect(environments.length).to.be.equal(1);
            expect(environments[0].id).to.equal('CmCvjNbg');
        });

        it('should search a raw configuration value without key anywhere in the configuration', async () => {
            const response = await request(server).get('/api/environments?filter[rawConfiguration][value]=fake-flp3');

            expect(response.status).to.equal(200);
            expect(response.body.data.map(({ id }) => id)).to.have.members(['TDI59So3d']);
        });

        it('should find a raw configuration fragment copied from the environment details page', async () => {
            // The details page displays values JSON-serialized, e.g. "[\"fake-flp1\", \"fake-flp2\"]"
            const response = await request(server)
                .get(`/api/environments?filter[rawConfiguration][value]=${encodeURIComponent('\\"fake-flp1\\", \\"fake-flp2')}`);

            expect(response.status).to.equal(200);
            expect(response.body.data.map(({ id }) => id)).to.have.members(['CmCvjNbg']);
        });

        it('should return 400 if the raw configuration filter has an empty key and no value', async () => {
            const response = await request(server).get('/api/environments?filter[rawConfiguration][key]=');

            expect(response.status).to.equal(400);
        });
    });
    describe('POST /api/environments', () => {
        it('should return 201 if valid data is provided', async () => {
            const response = await request(server).post('/api/environments').send({
                envId: 'New original env',
                rawConfiguration: 'epn=5\ndcs="enabled"',
                status: 'STANDBY',
                statusMessage: 'This is going very good',
            });

            expect(response.status).to.equal(201);

            const { data } = response.body;
            expect(data.id).to.equal('New original env');
            expect(data.rawConfiguration).to.equal('epn=5\ndcs="enabled"');
            expect(data.status).to.equal('STANDBY');
            expect(data.statusMessage).to.equal('This is going very good');
        });

        it('should return 400 if no id is provided', async () => {
            const response = await request(server).post('/api/environments');
            expect(response.status).to.equal(400);

            const { errors } = response.body;
            const titleError = errors.find((err) => err.source.pointer === '/data/attributes/body/envId');
            expect(titleError.detail).to.equal('"body.envId" is required');
        });

        it('should return 400 if createdAt is no date', async () => {
            const response = await request(server).post('/api/environments').send({
                envId: 'Cake environments',
                createdAt: 'This is no date',
            });
            expect(response.status).to.equal(400);

            const { errors } = response.body;
            const titleError = errors.find((err) => err.source.pointer === '/data/attributes/body/createdAt');
            expect(titleError.detail).to.equal('"body.createdAt" must be a valid date');
        });

        it('should return 409 if id already exists', async () => {
            const response = await request(server).post('/api/environments').send({
                envId: 'Dxi029djX',
            });

            expect(response.status).to.equal(409);
        });
    });
    describe('PUT /api/environment/:envId', () => {
        it('should return 400 if the wrong id is provided', async () => {
            const response = await request(server).put('/api/environments/99999');
            expect(response.status).to.equal(400);
        });
        it('should return 201 if valid data is given', async () => {
            const response = await request(server).put('/api/environments/KGIS12DS').send({
                status: 'DONE',
                statusMessage: 'This is a good environment.',
            });
            expect(response.status).to.equal(201);

            expect(response.body.data.status).to.equal('DONE');
            expect(response.body.data.statusMessage).to.equal('This is a good environment.');
        });
    });

    describe('GET /api/environments/:envId/logs/', () => {
        it('should successfully return a 200 response containing the logs linked to a given environment', async () => {
            const response = await request(server).get('/api/environments/8E4aZTjY/logs');
            expect(response.status).to.equal(200);
            expect(response.body.data).to.lengthOf(3);

            // Log 1 is linked to all kind of entities, which must be returned for logs displayed in embedded tables
            const log = response.body.data.find(({ id }) => id === 1);
            expect(log.runs).to.deep.equal([{ id: 1, runNumber: 1 }]);
            expect(log.lhcFills.map(({ fillNumber }) => fillNumber)).to.have.members([5, 6]);
            expect(log.environments.map(({ id }) => id)).to.have.members(['8E4aZTjY', 'eZF99lH6']);
            expect(log.dataPasses.map(({ name }) => name)).to.have.members(['LHC22b_apass1', 'LHC22b_skimming']);
            expect(log.simulationPasses.map(({ name }) => name)).to.have.members(['LHC23k6c', 'LHC23k6b']);
            expect(log.attachments).to.be.an('array');
        });
    });
};
