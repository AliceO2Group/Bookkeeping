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
const { getAllQualityControlFlagFlagReasons } = require('../../../../../lib/server/services/qualityControlFlag/getAllFlagReasons.js');

const QCFlagReasonSchema = Joi.object({
    id: Joi.number().required(),
    name: Joi.string().required(),
    method: Joi.string().required(),
    bad: Joi.boolean().required(),
    obsolate: Joi.boolean().required(),
});

const UserSchema = Joi.object({ id: Joi.number().required(), name: Joi.string().required(), externalId: Joi.number().required() });

const QCFlagVerificationSchema = Joi.object({
    id: Joi.number().required(),
    comment: Joi.string().required(),
    userId: Joi.number().required(),
    user: UserSchema,
    createdAt: Joi.number().required(),
    qualityControlFlagId: Joi.number().required(),
});

const QCFlagSchema = Joi.object({
    id: Joi.number().required(),
    timeStart: Joi.number().required(),
    timeEnd: Joi.number().required(),
    comment: Joi.string().required(),
    provenance: Joi.string().required().valid('HUMAN', 'SYNC', 'ASYNC', 'MC'),
    createdAt: Joi.number().required(),

    dataPassId: Joi.number().required(),
    runNumber: Joi.number().required(),
    detectorId: Joi.number().required(),

    userId: Joi.number().required(),
    user: UserSchema,
    flagReasonId: Joi.number().required(),
    flagReason: QCFlagReasonSchema,

    verifications: Joi.array().items(QCFlagVerificationSchema),
});

module.exports = () => {
    before(resetDatabaseContent);
    after(resetDatabaseContent);

    describe('Fetching quality control flags reasons', () => {
        it('should successfuly fetch quality control flags reasons', async () => {
            const flagReasons = await getAllQualityControlFlagFlagReasons();
            expect(flagReasons).to.be.an('array');
            expect(flagReasons).to.be.lengthOf(5);
            expect(flagReasons).to.have.all.deep.members([
                {
                    id: 2,
                    name: 'UnknownQuality',
                    method: 'Unknown Quality',
                    bad: true,
                    obsolate: true,
                },
                {
                    id: 3,
                    name: 'CertifiedByExpert',
                    method: 'Certified by Expert',
                    bad: false,
                    obsolate: true,
                },
                {
                    id: 11,
                    name: 'LimitedAcceptance',
                    method: 'Limited acceptance',
                    bad: true,
                    obsolate: true,
                },
                {
                    id: 12,
                    name: 'BadPID',
                    method: 'Bad PID',
                    bad: true,
                    obsolate: true,
                },
                {
                    id: 13,
                    name: 'Bad',
                    method: 'Bad',
                    bad: true,
                    obsolate: false,
                },

            ]);
        });
    });

    describe('Fetching quality control flags', () => {
        it('should succesfuly fetch all flags', async () => {
            const { rows: flags, count } = await qualityControlFlagService.getAll();
            expect(count).to.be.equal(4);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(4);
            for (const flag of flags) {
                await QCFlagSchema.validateAsync(flag);
            }
        });

        it('should succesfuly fetch all flags filtering with associations', async () => {
            const { rows: flags, count } = await qualityControlFlagService.getAll({
                filter: {
                    dataPassIds: [1],
                    runNumbers: [106],
                    detectorIds: [1],
                },
            });
            expect(count).to.be.equal(3);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(3);
            for (const flag of flags) {
                await QCFlagSchema.validateAsync(flag);
            }
        });

        it('should succesfuly fetch all flags filtering with associations - 2', async () => {
            const { rows: flags, count } = await qualityControlFlagService.getAll({
                filter: {
                    dataPassIds: [2],
                    runNumbers: [1],
                    detectorIds: [1],
                },
            });
            expect(count).to.be.equal(1);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(1);
            expect(flags[0]).to.be.eql({
                id: 4,
                timeStart: 1647924400000,
                timeEnd: 1647924400000,
                comment: 'Some qc comment 4',
                provenance: 'HUMAN',
                createdAt: 1707825436 * 1000,
                dataPassId: 2,
                runNumber: 1,
                detectorId: 1,
                userId: 2,
                user: { id: 2, externalId: 456, name: 'Jan Jansen' },
                flagReasonId: 13,
                flagReason: { id: 13, name: 'Bad', method: 'Bad', bad: true, obsolate: false },
                verifications: [
                    {
                        id: 2,
                        userId: 1,
                        user: { id: 1, externalId: 1, name: 'John Doe' },
                        comment: 'Accepted: Some qc comment 1',
                        createdAt: 1707825436 * 1000,
                        qualityControlFlagId: 4,
                    },
                ],
            });
        });

        it('should succesfuly fetch all flags filtering with externalUserIds', async () => {
            const { rows: flags, count } = await qualityControlFlagService.getAll({
                filter: {
                    externalUserIds: [1],
                },
            });
            expect(count).to.be.equal(3);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(3);
            for (const flag of flags) {
                await QCFlagSchema.validateAsync(flag);
            }
        });

        it('should succesfuly fetch all flags filtering with userNames', async () => {
            const { rows: flags, count } = await qualityControlFlagService.getAll({
                filter: {
                    userNames: ['Jan Jansen'],
                },
            });
            expect(count).to.be.equal(1);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(1);
            await QCFlagSchema.validateAsync(flags[0]);
            expect(flags[0].user.name).to.be.equal('Jan Jansen');
        });

        it('should succesfuly fetch all flags filtering with ids', async () => {
            const { rows: flags, count } = await qualityControlFlagService.getAll({
                filter: {
                    ids: [1, 4],
                },
            });
            expect(count).to.be.equal(2);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(2);
            expect(flags.map(({ id }) => id)).to.have.all.members([1, 4]);
        });
    });
};
