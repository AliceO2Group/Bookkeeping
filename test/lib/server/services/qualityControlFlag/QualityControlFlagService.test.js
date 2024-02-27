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
const assert = require('assert');
const { BadParameterError } = require('../../../../../lib/server/errors/BadParameterError.js');
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

    describe('Creating Quality Control Flag', () => {
        /** Flags for runNumber: 106, LHC22b_apass1, CPV */
        // Run trg time middle point: 1565314200, radius: 45000 seconds
        it('should fail to create quality control flag due to incorrect external user id', async () => {
            const qcFlagCreationParameters = {
                timeStart: (1565314200 - 10) * 1000,
                timeEnd: (1565314200 + 15000) * 1000,
                comment: 'VERY INTERSETING REMARK',
                provenance: 'HUMAN',
                externalUserId: 9999999, // Failing property
                flagReasonId: 2,
                runNumber: 106,
                dataPassId: 1,
                detectorId: 1,
            };

            await assert.rejects(
                () => qualityControlFlagService.create(qcFlagCreationParameters),
                new BadParameterError('User with this external id (9999999) could not be found'),
            );
        });

        it('should fail to create quality control flag due to incorrect qc flag time period', async () => {
            const qcFlagCreationParameters = {
                timeStart: (1565314200 - 50000) * 1000, // Failing property
                timeEnd: (1565314200 + 15000) * 1000,
                comment: 'VERY INTERSETING REMARK',
                provenance: 'HUMAN',
                externalUserId: 456,
                flagReasonId: 2,
                runNumber: 106,
                dataPassId: 1,
                detectorId: 1,
            };

            await assert.rejects(
                () => qualityControlFlagService.create(qcFlagCreationParameters),
                // eslint-disable-next-line max-len
                new BadParameterError(`Given QC flag period (${(1565314200 - 50000) * 1000} ${(1565314200 + 15000) * 1000}) is beyond run trigger period (${(1565314200 - 45000) * 1000}, ${(1565314200 + 45000) * 1000})`),
            );
        });

        it('should fail to create quality control flag due to incorrect qc flag time period', async () => {
            const qcFlagCreationParameters = {
                timeStart: (1565314200 + 10000) * 1000, // Failing property
                timeEnd: (1565314200 - 15000) * 1000, // Failing property
                comment: 'VERY INTERSETING REMARK',
                provenance: 'HUMAN',
                externalUserId: 456,
                flagReasonId: 2,
                runNumber: 106,
                dataPassId: 1,
                detectorId: 1,
            };

            await assert.rejects(
                () => qualityControlFlagService.create(qcFlagCreationParameters),
                new BadParameterError('Parameter `timeEnd` must be greater than `timeStart`'),
            );
        });

        it('should fail to create quality control flag due to due to no association', async () => {
            const qcFlagCreationParameters = {
                timeStart: (1565314200 - 10) * 1000,
                timeEnd: (1565314200 + 15000) * 1000,
                comment: 'VERY INTERSETING REMARK',
                provenance: 'HUMAN',
                externalUserId: 456,
                flagReasonId: 2,
                runNumber: 106,
                dataPassId: 9999, // Failing property
                detectorId: 111, // Failing property
            };

            await assert.rejects(
                () => qualityControlFlagService.create(qcFlagCreationParameters),
                // eslint-disable-next-line max-len
                new BadParameterError(`You cannot insert flag for data pass (id:${9999}), run (runNumber:${106}), detector (id:${111}) as there is no association between them`),
            );
        });

        it('should succesfuly create quality control flag with externalUserId', async () => {
            const qcFlagCreationParameters = {
                timeStart: (1565314200 - 10) * 1000,
                timeEnd: (1565314200 + 15000) * 1000,
                comment: 'VERY INTERSETING REMARK',
                provenance: 'HUMAN',
                externalUserId: 456,
                flagReasonId: 2,
                runNumber: 106,
                dataPassId: 1,
                detectorId: 1,
            };

            const flag = await qualityControlFlagService.create(qcFlagCreationParameters);
            delete qcFlagCreationParameters.externalUserId;
            expect(Object.entries(flag)).to.include.all.deep.members(Object.entries(qcFlagCreationParameters));
        });
    });

    describe('Creating Quality Control Flag Verification', () => {
        it('should fail to create verification due to incorrect external user id', async () => {
            const verificationParamteres = {
                qualityControlFlagId: 2,
                comment: 'Good',
                externalUserId: 9999,
            };
            assert.rejects(
                () => qualityControlFlagService.createVerification(verificationParamteres),
                new BadParameterError('User with this external id (9999999) could not be found'),
            );
        });

        it('should fail if QC Flag id is incorrect', async () => {
            const verificationParamteres = {
                qualityControlFlagId: 9999,
                comment: 'Treachery...',
                externalUserId: 1,
            };
            assert.rejects(
                () => qualityControlFlagService.createVerification(verificationParamteres),
                new BadParameterError('Cannot find qc flag with id 9999'),
            );
        });

        it('should fail if user tries to verify one\'s one flag', async () => {
            const verificationParamteres = {
                qualityControlFlagId: 1,
                comment: 'Treachery...',
                externalUserId: 1,
            };
            assert.rejects(
                () => qualityControlFlagService.createVerification(verificationParamteres),
                new Error('It is not possibly to verify one\'s own QC Flag (id:1)'),
            );
        });

        it('should successful create QC Flag verification', async () => {
            const verificationParamteres = {
                qualityControlFlagId: 2,
                comment: 'OK',
                externalUserId: 456,
            };
            await qualityControlFlagService.createVerification(verificationParamteres);
            const { rows: [{ verifications: [createdVerification] }] } = await qualityControlFlagService.getAll({ filter: { ids: [2] } });
            delete createdVerification.createdAt;
            expect(createdVerification).to.be.eql({
                id: 3,
                userId: 2,
                user: { id: 2, externalId: 456, name: 'Jan Jansen' },
                comment: 'OK',
                qualityControlFlagId: 2,
            });
        });
    });
};