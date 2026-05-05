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
const { BkpRoles } = require('../../lib/domain/enums/BkpRoles');
const { repositories: { GaqSummaryRepository } } = require('../../lib/database');
const { Op } = require('sequelize');

/**
 * Check whether an invalidation entry exists for a given data pass and run
 *
 * @param {number} expectedDataPassId
 * @param {number} expectedRunNumber
 * @param {boolean} toBePresent whether the invalidation is expected to be present
 *
 * @return {Promise<void>}
 */
const expectInvalidation = async (expectedDataPassId, expectedRunNumber, toBePresent = true) => {
    const invalidation = await GaqSummaryRepository.findOne({
        where: { dataPassId: expectedDataPassId, runNumber: expectedRunNumber, invalidatedAt: { [Op.not]: null } },
    });
    if (!toBePresent) {
        expect(invalidation, `Expected no invalidation for dataPassId=${expectedDataPassId} runNumber=${expectedRunNumber}`).to.be.null;
    } else {
        expect(invalidation, `Expected invalidation for dataPassId=${expectedDataPassId} runNumber=${expectedRunNumber}`).to.not.be.null;
    }
};

module.exports = () => {
    before(resetDatabaseContent);

    describe('POST /api/qcFlags/summary/gaq/recalculate', () => {
        it('should fail to recalculate the summaries because of insufficient permission', async () => {
            const response = await request(server).post(`/api/qcFlags/summary/gaq/recalculate?dataPassId=1&token=${BkpRoles.GUEST}`);

            expect(response.status).to.equal(403);
            const { errors } = response.body;
            expect(errors.find(({ title }) => title === 'Access denied')).to.not.be.null;
        });

        it('should return 400 when dataPassId parameter is missing', async () => {
            const response = await request(server)
                .post(`/api/qcFlags/summary/gaq/recalculate?runNumbers=107&token=${BkpRoles.DPG_ASYNC_QC_ADMIN}`);

            expect(response.status).to.equal(400);
            const { errors } = response.body;
            const dataPassIdError = errors.find((error) => error.source.pointer === '/data/attributes/query/dataPassId');
            expect(dataPassIdError.detail).to.equal('"query.dataPassId" is required');
        });

        it('should return 400 if dataPassId is not positive', async () => {
            const response = await request(server)
                .post(`/api/qcFlags/summary/gaq/recalculate?dataPassId=-1&token=${BkpRoles.DPG_ASYNC_QC_ADMIN}`);

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('"query.dataPassId" must be a positive number');
        });

        it('should return 400 if dataPassId is not a number', async () => {
            const response = await request(server)
                .post(`/api/qcFlags/summary/gaq/recalculate?dataPassId=abc&token=${BkpRoles.DPG_ASYNC_QC_ADMIN}`);

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('"query.dataPassId" must be a number');
        });

        it('should return 200 when runNumbers is a comma-separated list', async () => {
            const response = await request(server)
                .post(`/api/qcFlags/summary/gaq/recalculate?dataPassId=1&runNumbers=106,107&token=${BkpRoles.DPG_ASYNC_QC_ADMIN}`);

            expect(response.status).to.equal(200);
            expect(response.body.data).to.deep.equal({ summariesToRecalculate: 2 });
        });

        it('should return 400 if runNumbers contains a negative value', async () => {
            const response = await request(server)
                .post(`/api/qcFlags/summary/gaq/recalculate?dataPassId=1&runNumbers=-1&token=${BkpRoles.DPG_ASYNC_QC_ADMIN}`);

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('Invalid range: -1');
        });

        it('should return 400 if runNumbers contains an invalid range (start > end)', async () => {
            const response = await request(server)
                .post(`/api/qcFlags/summary/gaq/recalculate?dataPassId=1&runNumbers=200-100&token=${BkpRoles.DPG_ASYNC_QC_ADMIN}`);

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('Invalid range: 200-100');
        });

        it('should return 400 if runNumbers contains a range exceeding the max size of 100', async () => {
            const response = await request(server)
                .post(`/api/qcFlags/summary/gaq/recalculate?dataPassId=1&runNumbers=1-200&token=${BkpRoles.DPG_ASYNC_QC_ADMIN}`);

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('Given range exceeds max size of 100 range: 1-200');
        });

        it('should return 200 with the number of summaries that will be recalculated', async () => {
            const response = await request(server).post(`/api/qcFlags/summary/gaq/recalculate?dataPassId=1&runNumbers=107&token=${BkpRoles.DPG_ASYNC_QC_ADMIN}`);

            expect(response.status).to.equal(200);
            const { data } = response.body;
            expect(data).to.deep.equal({ summariesToRecalculate: 1 });

            await expectInvalidation(1, 107, true);
        });
    });

    describe('GET /api/qcFlags/summary/gaq', () => {

        before(async () => {
            await resetDatabaseContent();
    
            await GaqSummaryRepository.upsert({
                dataPassId: 1,
                runNumber: 107,
                badRunCoverage: 0,
                explicitlyNotBadRunCoverage: 0.759654,
                mcReproducibleCoverage: 0.240346,
                missingVerificationsCount: 3,
                undefinedQualityPeriodsCount: 0,
                notComputable: false,
                invalidatedAt: null,
            });
        });

        it('should return 200 with the correct GAQ summary with mcReproducibleAsNotBad=false', async () => {
            const response = await request(server).get('/api/qcFlags/summary/gaq?dataPassId=1&mcReproducibleAsNotBad=false&runNumber=107');

            expect(response.status).to.equal(200);
            const { data } = response.body;
            expect(data).to.deep.equal({
                badEffectiveRunCoverage: 0.240346,
                explicitlyNotBadEffectiveRunCoverage: 0.759654,
                mcReproducible: true,
                missingVerificationsCount: 3,
                undefinedQualityPeriodsCount: 0,
                notComputable: false,
                invalidatedAt: null,
            });
        });

        it('should return 200 with the correct GAQ summary with mcReproducibleAsNotBad=true', async () => {
            const response = await request(server).get('/api/qcFlags/summary/gaq?dataPassId=1&mcReproducibleAsNotBad=true&runNumber=107');

            expect(response.status).to.equal(200);
            const { data } = response.body;
            expect(data).to.deep.equal({
                badEffectiveRunCoverage: 0,
                explicitlyNotBadEffectiveRunCoverage: 1,
                mcReproducible: true,
                missingVerificationsCount: 3,
                undefinedQualityPeriodsCount: 0,
                notComputable: false,
                invalidatedAt: null,
            });
        });

        it('should return 200 with a calculated summary that is invalidated', async () => {
            await GaqSummaryRepository.upsert({ dataPassId: 1, runNumber: 107, invalidatedAt: new Date() });

            const response = await request(server).get('/api/qcFlags/summary/gaq?dataPassId=1&mcReproducibleAsNotBad=false&runNumber=107');

            expect(response.status).to.equal(200);
            const { data } = response.body;
            expect(data.invalidatedAt).to.not.be.null;
            delete data.invalidatedAt;
            expect(data).to.deep.equal({
                badEffectiveRunCoverage: 0.240346,
                explicitlyNotBadEffectiveRunCoverage: 0.759654,
                mcReproducible: true,
                missingVerificationsCount: 3,
                undefinedQualityPeriodsCount: 0,
                notComputable: false,
            });
        });

        it('should return 200 with a not-calculated summary that is invalidated', async () => {
            await GaqSummaryRepository.insert({ dataPassId: 1, runNumber: 106, invalidatedAt: new Date() });

            const response = await request(server).get('/api/qcFlags/summary/gaq?dataPassId=1&mcReproducibleAsNotBad=false&runNumber=106');

            expect(response.status).to.equal(200);
            const { data } = response.body;
            expect(data.invalidatedAt).to.not.be.null;
        });

        it('should return 400 if dataPassId is not positive', async () => {
            const response = await request(server).get('/api/qcFlags/summary/gaq?dataPassId=-1&runNumber=107');

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('"query.dataPassId" must be a positive number');
        });

        it('should return 400 if runNumber is not positive', async () => {
            const response = await request(server).get('/api/qcFlags/summary/gaq?dataPassId=1&runNumber=-1');

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('"query.runNumber" must be a positive number');
        });

        it('should return 400 if dataPassId is not a number', async () => {
            const response = await request(server).get('/api/qcFlags/summary/gaq?dataPassId=abc&runNumber=107');

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('"query.dataPassId" must be a number');
        });

        it('should return 400 if runNumber is not a number', async () => {
            const response = await request(server).get('/api/qcFlags/summary/gaq?dataPassId=1&runNumber=abc');

            expect(response.status).to.equal(400);
            expect(response.body.errors[0].detail).to.equal('"query.runNumber" must be a number');
        });

        it('should return 400 when dataPassId parameter is missing', async () => {
            const response = await request(server).get('/api/qcFlags/summary/gaq?runNumber=107');

            expect(response.status).to.equal(400);
            const { errors } = response.body;
            const dataPassIdError = errors.find((error) => error.source.pointer === '/data/attributes/query/dataPassId');
            expect(dataPassIdError.detail).to.equal('"query.dataPassId" is required');
        });
    });
    
};
