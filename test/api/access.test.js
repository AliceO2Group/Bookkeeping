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
const { tag: { CreateTagUseCase } } = require('../../lib/usecases');
const { dtos: { CreateTagDto } } = require('../../lib/domain');
const { resetDatabaseContent } = require('../utilities/resetDatabaseContent.js');

const { server } = require('../../lib/application');
const { RunDetectorQualities } = require('../../lib/domain/enums/RunDetectorQualities');

process.env.NODE_ENV = 'test access';

module.exports = () => {
    before(resetDatabaseContent);

    describe('GET requests on public routes', () => {
        it('should return 200 with admin rights', async () => {
            const response = await request(server)
                .get('/api/tags')
                .send({
                    access: ['admin'],
                });
            expect(response.status).to.equal(200);
        });
        it('should return 200 with public rights', async () => {
            const response = await request(server)
                .get('/api/tags')
                .send({
                    access: ['public'],
                });
            expect(response.status).to.equal(200);
        });
        it('should return 200 with valid and invalid rights', async () => {
            const response = await request(server)
                .get('/api/tags')
                .send({
                    access: ['qwerty', 'admin'],
                });
            expect(response.status).to.equal(200);
        });
        it('should return 403 with invalid rights', async () => {
            const response = await request(server)
                .get('/api/tags')
                .send({
                    access: ['qwerty'],
                });
            expect(response.status).to.equal(403);
        });
        it('should return 403 with no rights', async () => {
            const response = await request(server)
                .get('/api/tags')
                .send({
                    access: [],
                });
            expect(response.status).to.equal(403);
        });
    });
    describe('POST requests on admin routes', () => {
        it('should return 201 with admin rights', async () => {
            const response = await request(server)
                .post('/api/tags')
                .send({
                    access: ['admin'],
                    text: 'text1',
                    email: 'test@cern.ch',
                });
            expect(response.status).to.equal(201);
        });
        it('should return 201 with both admin and non-admin rights', async () => {
            const response = await request(server)
                .post('/api/tags')
                .send({
                    access: ['guest', 'admin'],
                    text: 'text3',
                    email: 'test@cern.ch',
                });
            expect(response.status).to.equal(201);
        });
        it('should return 403 with no rights', async () => {
            const response = await request(server)
                .post('/api/tags')
                .send({
                    access: [],
                    text: 'text4',
                    email: 'test@cern.ch',
                });
            expect(response.status).to.equal(403);
        });
        it('should return 403 with guest rights', async () => {
            const response = await request(server)
                .post('/api/tags')
                .send({
                    access: ['guest'],
                    text: 'text5',
                    email: 'test@cern.ch',
                });
            expect(response.status).to.equal(403);
        });
    });
    describe('PUT and DELETE requests on admin routes', async () => {
        let id;
        before(async () => {
            const createTagDto = await CreateTagDto.validateAsync({
                body: { text: 'qwerty' },
            });
            id = (await new CreateTagUseCase().execute(createTagDto))?.id;
        });

        it('PUT should return 403 without admin access', async () => {
            const response = await request(server)
                .put(`/api/tags/${id}`)
                .send({
                    access: ['guest'],
                    email: 'test@cern.ch',
                });
            expect(response.status).to.equal(403);
        });
        it('PUT should return 201 with admin access', async () => {
            const response = await request(server)
                .put(`/api/tags/${id}`)
                .send({
                    access: ['admin'],
                    email: 'test@cern.ch',
                });
            expect(response.status).to.equal(201);
        });
        it('DELETE should return 403 without admin access', async () => {
            const response = await request(server)
                .delete(`/api/tags/${id}`)
                .send({
                    access: ['guest'],
                });
            expect(response.status).to.equal(403);
        });
        it('DELETE should return 200 with admin access', async () => {
            const response = await request(server)
                .delete(`/api/tags/${id}`)
                .send({
                    access: ['admin'],
                });
            expect(response.status).to.equal(200);
        });
    });
    describe('PUT requests for detector-specific routes', async () => {
        it('should return 403 if user edits other detector', async () => {
            const response = await request(server)
                .put('/api/runs/106')
                .send({
                    access: ['det-emc'], // EMC.id === 2
                    detectorsQualities: [{ detectorId: 1, quality: RunDetectorQualities.GOOD }],
                    detectorsQualitiesChangeReason: 'test',
                });
            expect(response.status).to.equal(403);
        });
        it('should return 201 if user edits their own detector', async () => {
            const response = await request(server)
                .put('/api/runs/106')
                .send({
                    access: ['det-cpv'], // CPV.id === 1
                    detectorsQualities: [{ detectorId: 1, quality: RunDetectorQualities.GOOD }],
                    detectorsQualitiesChangeReason: 'test',
                });
            expect(response.status).to.equal(201);
        });
        it('should return 201 if user has both admin and other detector rights', async () => {
            const response = await request(server)
                .put('/api/runs/106')
                .send({
                    access: ['admin', 'det-emc'],
                    detectorsQualities: [{ detectorId: 1, quality: RunDetectorQualities.BAD }],
                    detectorsQualitiesChangeReason: 'test',
                });
            expect(response.status).to.equal(201);
        });
    });
};
