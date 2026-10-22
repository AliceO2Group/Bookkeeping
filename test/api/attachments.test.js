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

    describe('POST /api/attachments', () => {
        it('should return 200', async () => {
            const response = await request(server)
                .post('/api/attachments')
                .field('log', '1')
                .attach('attachments', path.resolve(__dirname, '..', 'assets', '1200px-CERN_logo.png'));
            expect(response.status).to.equal(201);
            expect(response.body.data).to.have.all.keys('id', 'fileName', 'size', 'mimeType', 'originalName', 'path', 'encoding', 'logId');
            expect(response.body.data.logId).to.equal(1);
        });

        it('should return 400 if no file is given', async () => {
            const response = await request(server).post('/api/attachments').field('log', '1');

            expect(response.status).to.equal(400);
            expect(getValidationErrors(response)).to.eql({ files: '"files" must contain at least 1 items' });
        });

        it('should return 400 if the log id is not a positive integer', async () => {
            const response = await request(server).post('/api/attachments').field('log', 'abc');

            expect(response.status).to.equal(400);
            expect(getValidationErrors(response)['body/log']).to.equal('"body.log" must be a number');
        });
    });

    describe('GET /api/attachments/:attachmentId', () => {
        it('should return 200', async () => {
            const response = await request(server).get('/api/attachments/1');
            expect(response.status).to.equal(200);
        });

        it('should return 404 if the attachment does not exist', async () => {
            const response = await request(server).get('/api/attachments/999999999');

            expect(response.status).to.equal(404);
            expect(response.body.errors).to.eql([
                { status: 404, title: 'Not found', detail: 'Attachment with this id (999999999) could not be found' },
            ]);
        });

        it('should return 400 if the attachment id is not a positive integer', async () => {
            const response = await request(server).get('/api/attachments/0');

            expect(response.status).to.equal(400);
            expect(getValidationErrors(response)).to.eql({ 'params/attachmentId': '"params.attachmentId" must be a positive number' });
        });
    });
};
