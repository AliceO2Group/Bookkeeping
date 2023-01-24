/* eslint-disable no-trailing-spaces */
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

const request = require('supertest');
const { expect } = require('chai');
const { server } = require('../../lib/application');
const { resetDatabaseContent } = require('../utilities/resetDatabaseContent.js');

module.exports = () => {
    describe('GET /api/status', () => {
        before(resetDatabaseContent);

        it('should return up to date gui status', async () => {
            const response = await request(server).get('/api/status/gui');
            expect(response.status).to.equal(200);
            expect(response.body.data.status.ok).to.equal(true);
        });
        it.skip('should return up to date database connection status', () => {
            const response = request(server).get('/api/status/database');
            expect(response.status).to.equal(200);
            expect(response.body.data.status.ok).to.equal(true);
        });
    });
};
