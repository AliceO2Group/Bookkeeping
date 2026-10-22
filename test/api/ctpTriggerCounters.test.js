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

const { resetDatabaseContent } = require('../utilities/resetDatabaseContent');
const request = require('supertest');
const { server } = require('../../lib/application');
const { expect } = require('chai');

module.exports = () => {
    before(resetDatabaseContent);

    describe('GET /api/ctp-trigger-counters', () => {
        it('Should successfully return the list of trigger counters for a given run', async () => {
            {
                const response = await request(server).get('/api/ctp-trigger-counters/1');

                expect(response.status).to.equal(200);
                response.body.data.forEach((counters) => expect(Object.keys(counters)).to.have.members(
                    ['id', 'timestamp', 'runNumber', 'className', 'lmb', 'lma', 'l0b', 'l0a', 'l1b', 'l1a'],
                ));
                expect(response.body.data.map(({ id, runNumber, className }) => ({ id, runNumber, className }))).to.deep.eql([
                    { id: 1, runNumber: 1, className: 'FIRST-CLASS-NAME' },
                    { id: 2, runNumber: 1, className: 'SECOND-CLASS-NAME' },
                ]);
            }
            {
                const response = await request(server).get('/api/ctp-trigger-counters/2');

                expect(response.status).to.equal(200);
                expect(response.body.data.map(({ id }) => id)).to.eql([]);
            }
        });

        it('Should return 404 if the run does not exist', async () => {
            const response = await request(server).get('/api/ctp-trigger-counters/999999999');

            expect(response.status).to.equal(404);
            expect(response.body.errors).to.eql([
                { status: 404, title: 'Not found', detail: 'Run with this run number (999999999) could not be found' },
            ]);
        });

        it('Should return 400 if the run number is not a positive integer', async () => {
            for (const [runNumber, message] of [
                ['abc', '"params.runNumber" must be a number'],
                ['-1', '"params.runNumber" must be a positive number'],
                ['0', '"params.runNumber" must be a positive number'],
                ['0.5', '"params.runNumber" must be an integer'],
            ]) {
                const response = await request(server).get(`/api/ctp-trigger-counters/${runNumber}`);

                expect(response.status, `run number ${runNumber}`).to.equal(400);
                const error = response.body.errors.find(({ source: { pointer } }) => pointer === '/data/attributes/params/runNumber');
                expect(error.detail, `run number ${runNumber}`).to.equal(message);
            }
        });
    });
};
