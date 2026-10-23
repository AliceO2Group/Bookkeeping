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
const { server } = require('../../lib/application');
const { resetDatabaseContent } = require('../utilities/resetDatabaseContent.js');
const { DetectorType } = require('../../lib/domain/enums/DetectorTypes');
const { BkpRoles } = require('../../lib/domain/enums/BkpRoles');

/**
 * Return the validation errors of a response as an object mapping the pointer of each error to its detail
 *
 * @param {object} response the response
 * @return {Object<string, string>} the details of the errors by pointer
 */
const getValidationErrors = (response) => Object.fromEntries(
    response.body.errors.map(({ source: { pointer }, detail }) => [pointer.replace('/data/attributes/', ''), detail]),
);

module.exports = () => {
    before(resetDatabaseContent);

    describe('POST /api/gaqDetectors', () => {
        it('should successfully set GAQ detectors', async () => {
            const dataPassId = 3;
            const runNumbers = [49, 56];
            const detectorIds = [4, 7];
            const response = await request(server).post(`/api/gaqDetectors?token=${BkpRoles.GAQ}`).send({
                dataPassId,
                runNumbers,
                detectorIds,
            });
            expect(response.status).to.be.equal(201);
            expect(response.body.data).to.have.all.deep.members(runNumbers
                .flatMap((runNumber) => detectorIds.map((detectorId) => ({ dataPassId, runNumber, detectorId }))));
        });

        it('should fail to set GAQ detectors if a field is missing', async () => {
            const response = await request(server).post(`/api/gaqDetectors?token=${BkpRoles.GAQ}`).send({});

            expect(response.status).to.be.equal(400);
            expect(getValidationErrors(response)).to.eql({
                'body/dataPassId': '"body.dataPassId" is required',
                'body/runNumbers': '"body.runNumbers" is required',
                'body/detectorIds': '"body.detectorIds" is required',
            });
        });

        it('should fail to set GAQ detectors if an id is not a positive integer or is duplicated', async () => {
            let response = await request(server).post(`/api/gaqDetectors?token=${BkpRoles.GAQ}`).send({
                dataPassId: 0,
                runNumbers: [0],
                detectorIds: [-1],
            });
            expect(response.status).to.be.equal(400);
            expect(getValidationErrors(response)).to.eql({
                'body/dataPassId': '"body.dataPassId" must be a positive number',
                'body/runNumbers/0': '"body.runNumbers[0]" must be a positive number',
                'body/detectorIds/0': '"body.detectorIds[0]" must be a positive number',
            });

            response = await request(server).post(`/api/gaqDetectors?token=${BkpRoles.GAQ}`).send({
                dataPassId: 'abc',
                runNumbers: [1.5],
                detectorIds: [1, 1],
            });
            expect(response.status).to.be.equal(400);
            expect(getValidationErrors(response)).to.eql({
                'body/dataPassId': '"body.dataPassId" must be a number',
                'body/runNumbers/0': '"body.runNumbers[0]" must be an integer',
                'body/detectorIds/1': '"body.detectorIds[1]" contains a duplicate value',
            });
        });

        it('should fail to set GAQ detectors because of insufficient permission', async () => {
            const dataPassId = 3;
            const runNumbers = [49, 56];
            const detectorIds = [4, 7];
            const response = await request(server).post(`/api/gaqDetectors?token=${BkpRoles.GUEST}`).send({
                dataPassId,
                runNumbers,
                detectorIds,
            });
            expect(response.status).to.be.equal(403);

            const { errors } = response.body;
            expect(errors.find(({ title }) => title === 'Access denied')).to.not.be.null;
        });
    });

    describe('GET /api/gaqDetectors', () => {
        it('should return 400 if the data pass id or the run number is missing', async () => {
            const response = await request(server).get('/api/gaqDetectors');

            expect(response.status).to.equal(400);
            expect(getValidationErrors(response)).to.eql({
                'query/dataPassId': '"query.dataPassId" is required',
                'query/runNumber': '"query.runNumber" is required',
            });
        });

        it('should return 400 if the data pass id or the run number is not a positive integer', async () => {
            const response = await request(server).get('/api/gaqDetectors?dataPassId=-1&runNumber=abc');

            expect(response.status).to.equal(400);
            expect(getValidationErrors(response)).to.eql({
                'query/dataPassId': '"query.dataPassId" must be a positive number',
                'query/runNumber': '"query.runNumber" must be a number',
            });
        });

        it('should return 200 with the list of GAQ detectors', async () => {
            const response = await request(server).get('/api/gaqDetectors?dataPassId=3&runNumber=56');

            expect(response.status).to.equal(200);
            const { data } = response.body;
            expect(data).to.be.an('array');
            expect(data).to.have.all.deep.members([
                { id: 7, name: 'FT0', type: DetectorType.PHYSICAL },
                { id: 4, name: 'ITS', type: DetectorType.PHYSICAL },
            ]);
        });
    });
};
