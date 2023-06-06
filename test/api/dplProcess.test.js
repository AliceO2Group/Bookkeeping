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
};
