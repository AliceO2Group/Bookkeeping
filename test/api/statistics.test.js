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

module.exports = () => {
    before(resetDatabaseContent);

    describe('GET /statistics/lhc-fills', () => {
        it('should return 200 and an array for a normal request', async () => {
            const response = await request(server).get('/api/statistics/lhc-fills?from=156525120000&to=1565305200000');

            expect(response.status).to.equal(200);
            expect(response.body.data).to.lengthOf(1);
        });

        it('should return 400 if the request is invalid', async () => {
            {
                const response = await request(server).get('/api/statistics/lhc-fills');

                expect(response.status).to.equal(400);
                expect(response.body.errors).to.lengthOf(2);
                expect(response.body.errors[0].detail).to.equal('"query.from" is required');
                expect(response.body.errors[1].detail).to.equal('"query.to" is required');
            }
            {
                const response = await request(server).get('/api/statistics/lhc-fills?to=1565305200000');

                expect(response.status).to.equal(400);
                expect(response.body.errors).to.lengthOf(1);
                expect(response.body.errors[0].detail).to.equal('"query.from" is required');
            }
            {
                const response = await request(server).get('/api/statistics/lhc-fills?from=156525120000');

                expect(response.status).to.equal(400);
                expect(response.body.errors).to.lengthOf(1);
                expect(response.body.errors[0].detail).to.equal('"query.to" is required');
            }
        });

        it('should return 400 if the request is invalid', async () => {
        });
    });
};
