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

const path = require('path');
const request = require('supertest');
const { resetDatabaseContent } = require('../utilities/resetDatabaseContent.js');
const { server } = require('../../lib/application');
const { expect } = require('chai');

module.exports = () => {
    before(resetDatabaseContent);

    describe('POST /api/attachments', () => {
        it('should return 200', async () => {
            const response = await request(server)
                .post('/api/attachments')
                .field('log', '1')
                .attach('attachments', path.resolve(__dirname, '..', 'assets', '1200px-CERN_logo.png'));
            expect(response.status).to.equal(201);
        });
    });

    describe('GET /api/attachments/:attachmentId', () => {
        it('should return 200', async () => {
            const response = await request(server).get('/api/attachments/1');
            expect(response.status).to.equal(200);
        });
    });
};
