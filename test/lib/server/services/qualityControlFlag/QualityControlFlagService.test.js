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

const { qualityControlFlagService } = require('../../../../../lib/server/services/qualityControlFlag/QualityControlFlagService.js');
const { resetDatabaseContent } = require('../../../../utilities/resetDatabaseContent.js');
const { expect } = require('chai');
const Joi = require('joi');

const QCFlagReasonSchema = Joi.object({
    id: Joi.number(),
    name: Joi.string(),
    method: Joi.string(),
    bad: Joi.boolean(),
    obsolate: Joi.boolean(),
});

const UserSchema = Joi.object({ id: Joi.number(), name: Joi.string(), externalId: Joi.number() });

const QCFlagVerificationSchema = Joi.object({
    id: Joi.number(),
    comment: Joi.string(),
    userId: Joi.number(),
    user: UserSchema,
    createdAt: Joi.number(),
});

const QCFlagSchema = Joi.object({
    id: Joi.number(),
    timeStart: Joi.number(),
    timeEnd: Joi.number(),
    comment: Joi.string(),
    provenance: Joi.string().valid('HUMAN', 'SYNC', 'ASYNC', 'MC'),
    createdAt: Joi.number(),

    dataPassId: Joi.number(),
    runNumber: Joi.number(),
    detectorId: Joi.number(),

    user: UserSchema,
    flagReason: QCFlagReasonSchema,
    verifications: Joi.array().items(QCFlagVerificationSchema),
});

module.exports = () => {
    before(resetDatabaseContent);

    describe('Fetching quality control flags', () => {
        it('Get all Flags', async () => {
            const flags = await qualityControlFlagService.getAll();
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(4);
            for (const flag of flags) {
                await QCFlagSchema.validateAsync(flag);
            }
        });

        it('Get all Flags filtering with associations', async () => {
            const flags = await qualityControlFlagService.getAll({
                filter: {
                    dataPassIds: [1],
                    runNumbers: [106],
                    detectorIds: [1],
                },
            });
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(3);
            for (const flag of flags) {
                await QCFlagSchema.validateAsync(flag);
            }
        });

        it('Get all Flags filtering with associations - 2', async () => {
            const flags = await qualityControlFlagService.getAll({
                filter: {
                    dataPassIds: [2],
                    runNumbers: [1],
                    detectorIds: [1],
                },
            });
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(1);
            expect(flags[0]).to.be.eql({
                id: 4,
                timeStart: 1647924000,
                timeEnd: 1647924000,
                comment: 'Some qc comment 4',
                createdAt: 1707825436000,
                dataPassId: 2,
                runNumber: 1,
                detectorId: 1,
                user: { id: 2, externalId: 456, name: 'Jan Jansen' },
                flagReason: { id: 13, name: 'Bad', method: 'Bad', bad: true, obsolate: false },
                verifications: [
                    {
                        id: 2,
                        userId: 1,
                        user: { id: 2, externalId: 456, name: 'Jan Jansen' },
                        comment: 'Accepted: Some qc comment 1',
                        createdAt: 1707825436000,
                    },
                ],
            });
        });
    });
};
