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
const { server } = require('../../lib/application.js');
const { expect } = require('chai');
const { emptyECSEosReportRequest } = require('../mocks/mock-ecs-eos-report.js');

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

    describe('POST /api/eos-report', () => {
        it('should successfully generate an ECS EOS report log and return its id', async () => {
            const reportRequest = { ...emptyECSEosReportRequest };
            delete reportRequest.shiftStart;
            const response = await request(server).post('/api/eos-report?reportType=ECS').send(reportRequest);

            expect(response.status).to.equal(201);
            expect(response.body.data).to.be.an('object');
            expect(response.body.data.id).to.equal(120);
        });

        it('should return 400 if the report type is not a known one', async () => {
            const response = await request(server)
                .post('/api/eos-report?reportType=UNKNOWN')
                .send({ shifterName: 'John Doe', typeSpecific: {} });

            expect(response.status).to.equal(400);
            expect(getValidationErrors(response)['query/reportType'])
                .to.equal('"query.reportType" must be one of [ECS, QC/PDP, SLIMOS, SL, DCS]');
        });

        it('should return 400 if the type specific part of the report is missing', async () => {
            const response = await request(server).post('/api/eos-report?reportType=ECS').send({ shifterName: 'John Doe' });

            expect(response.status).to.equal(400);
            expect(getValidationErrors(response)).to.eql({ 'body/typeSpecific': '"body.typeSpecific" is required' });
        });

        it('should return 400 if the start of the shift is given, as it is deduced from the current time', async () => {
            const response = await request(server).post('/api/eos-report?reportType=ECS').send({ ...emptyECSEosReportRequest });

            expect(response.status).to.equal(400);
            expect(getValidationErrors(response)).to.eql({ 'body/shiftStart': '"body.shiftStart" is not allowed' });
        });
    });
};
