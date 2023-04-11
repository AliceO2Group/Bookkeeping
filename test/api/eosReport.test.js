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
const { emptyEorReportRequest } = require('../mocks/mock-eos-report.js');

module.exports = () => {
    before(resetDatabaseContent);

    describe('GET /api/eos-report', () => {
        it('should successfully generate an ECS EOS report log and return its id', async () => {
            const reportRequest = { ...emptyEorReportRequest };
            delete reportRequest.shiftStart;
            const response = await request(server).post('/api/eos-report?reportType=ECS').send(reportRequest);

            expect(response.status).to.equal(201);
            expect(response.body.data).to.be.an('object');
            expect(response.body.data.id).to.equal(120);
        });
    });
};
