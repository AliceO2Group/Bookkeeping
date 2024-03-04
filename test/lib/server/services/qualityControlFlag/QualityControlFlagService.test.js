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
const { getAllQualityControlFlagTypes } = require('../../../../../lib/server/services/qualityControlFlag/getAllQualityControlFlagTypes.js');
const assert = require('assert');
const { BadParameterError } = require('../../../../../lib/server/errors/BadParameterError.js');
const QualityControlFlagRepository = require('../../../../../lib/database/repositories/QualityControlFlagRepository.js');

const QCFlagTypeSchema = Joi.object({
    id: Joi.number().required(),
    name: Joi.string().required(),
    method: Joi.string().required(),
    bad: Joi.boolean().required(),
    archived: Joi.boolean().required(),
    archivedAt: Joi.number().allow(null),
});

const UserSchema = Joi.object({ id: Joi.number().required(), name: Joi.string().required(), externalId: Joi.number().required() });

const QCFlagSchema = Joi.object({
    id: Joi.number().required(),
    from: Joi.number().required(),
    to: Joi.number().required(),
    comment: Joi.string().required(),
    createdAt: Joi.number().required(),

    runNumber: Joi.number().required(),
    dplDetectorId: Joi.number().required(),

    createdById: Joi.number().required(),
    user: UserSchema,
    flagTypeId: Joi.number().required(),
    flagType: QCFlagTypeSchema,
});

module.exports = () => {
    before(resetDatabaseContent);
    after(resetDatabaseContent);

    describe('Fetching quality control flags types', () => {
        it('should successfuly fetch quality control flags types', async () => {
            const flagTypes = await getAllQualityControlFlagTypes();
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(5);
            expect(flagTypes.map(({ id, name, method, bad, archived }) => ({ id, name, method, bad, archived }))).to.have.all.deep.members([
                {
                    id: 2,
                    name: 'UnknownQuality',
                    method: 'Unknown Quality',
                    bad: true,
                    archived: false,
                },
                {
                    id: 3,
                    name: 'CertifiedByExpert',
                    method: 'Certified by Expert',
                    bad: false,
                    archived: false,
                },
                {
                    id: 11,
                    name: 'LimitedAcceptance',
                    method: 'Limited acceptance',
                    bad: true,
                    archived: false,
                },
                {
                    id: 12,
                    name: 'BadPID',
                    method: 'Bad PID',
                    bad: true,
                    archived: false,
                },
                {
                    id: 13,
                    name: 'Bad',
                    method: 'Bad',
                    bad: true,
                    archived: false,
                },

            ]);
        });
    });

    describe('Fetching quality control flags', () => {
        it('should successfully fetch quality control flag by id', async () => {
            const qcFlag = await qualityControlFlagService.getOneOrFail(1);
            expect(qcFlag.id).to.be.equal(1);
            QCFlagSchema.validateAsync(qcFlag);
        });

        it('should throw error when flag with given id cannot be found', async () => {
            await assert.rejects(
                () => qualityControlFlagService.getOneOrFail(99999),
                new BadParameterError('Quality Control Flag with this id (99999) could not be found'),
            );
        });

        it('should succesfuly fetch all flags', async () => {
            const { rows: flags, count } = await qualityControlFlagService.getAll();
            expect(count).to.be.equal(5);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(5);
            for (const flag of flags) {
                await QCFlagSchema.validateAsync(flag);
            }
        });

        it('should succesfuly fetch all flags filtering with associations', async () => {
            const { rows: flags, count } = await qualityControlFlagService.getAll({
                filter: {
                    dataPassIds: [1],
                    runNumbers: [106],
                    dplDetectorIds: [1],
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
                    dplDetectorIds: [1],
                },
            });
            expect(count).to.be.equal(1);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(1);
            expect(flags[0]).to.be.eql({
                id: 4,
                from: 1647924400000,
                to: 1647924400000,
                comment: 'Some qc comment 4',
                runNumber: 1,
                dplDetectorId: 1,
                createdById: 2,
                user: { id: 2, externalId: 456, name: 'Jan Jansen' },
                flagTypeId: 13,
                flagType: { id: 13, name: 'Bad', method: 'Bad', bad: true, archived: false, archivedAt: null },
                createdAt: 1707825436 * 1000,
            });
        });

        it('should succesfuly fetch all flags filtering with associations (simulation pass)', async () => {
            const { rows: flags, count } = await qualityControlFlagService.getAll({
                filter: {
                    simulationPassIds: [1],
                    runNumbers: [106],
                    dplDetectorIds: [1],
                },
            });
            expect(count).to.be.equal(1);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(1);
            expect(flags[0].id).to.be.eql(5);
        });

        it('should succesfuly fetch all flags filtering with userNames', async () => {
            const { rows: flags, count } = await qualityControlFlagService.getAll({
                filter: {
                    userNames: ['Jan Jansen'],
                },
            });
            expect(count).to.be.equal(2);
            expect(flags).to.be.an('array');
            expect(flags).to.be.lengthOf(2);
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
                fromTime: (1565314200 - 10) * 1000,
                toTime: (1565314200 + 15000) * 1000,
                comment: 'VERY INTERSETING REMARK',
                externalUserId: 9999999, // Failing property
                flagTypeId: 2,
                runNumber: 106,
                dataPassId: 1,
                dplDetectorId: 1,
            };

            await assert.rejects(
                () => qualityControlFlagService.createForDataPass(qcFlagCreationParameters),
                new BadParameterError('User with this external id (9999999) could not be found'),
            );
        });

        it('should fail to create quality control flag due to incorrect qc flag time period', async () => {
            const qcFlagCreationParameters = {
                fromTime: (1565314200 - 50000) * 1000, // Failing property
                toTime: (1565314200 + 15000) * 1000,
                comment: 'VERY INTERSETING REMARK',
                externalUserId: 456,
                flagTypeId: 2,
                runNumber: 106,
                dataPassId: 1,
                dplDetectorId: 1,
            };

            await assert.rejects(
                () => qualityControlFlagService.createForDataPass(qcFlagCreationParameters),
                // eslint-disable-next-line max-len
                new BadParameterError(`Given QC flag period (${(1565314200 - 50000) * 1000} ${(1565314200 + 15000) * 1000}) is beyond run trigger period (${(1565314200 - 45000) * 1000}, ${(1565314200 + 45000) * 1000})`),
            );
        });

        it('should fail to create quality control flag due to incorrect qc flag time period', async () => {
            const qcFlagCreationParameters = {
                fromTime: (1565314200 + 10000) * 1000, // Failing property
                toTime: (1565314200 - 15000) * 1000, // Failing property
                comment: 'VERY INTERSETING REMARK',
                externalUserId: 456,
                flagTypeId: 2,
                runNumber: 106,
                dataPassId: 1,
                dplDetectorId: 1,
            };

            await assert.rejects(
                () => qualityControlFlagService.createForDataPass(qcFlagCreationParameters),
                new BadParameterError('Parameter `toTime` must be greater than `fromTime`'),
            );
        });

        it('should fail to create quality control flag due to due to no association', async () => {
            const qcFlagCreationParameters = {
                fromTime: (1565314200 - 10) * 1000,
                toTime: (1565314200 + 15000) * 1000,
                comment: 'VERY INTERSETING REMARK',
                externalUserId: 456,
                flagTypeId: 2,
                runNumber: 106,
                dataPassId: 9999, // Failing property
                dplDetectorId: 1,
            };

            await assert.rejects(
                () => qualityControlFlagService.createForDataPass(qcFlagCreationParameters),
                // eslint-disable-next-line max-len
                new BadParameterError(`You cannot insert flag for data pass (id:${9999}), run (runNumber:${106}), detector (name:CPV) as there is no association between them`),
            );
        });

        it('should succesfuly create quality control flag with externalUserId', async () => {
            const qcFlagCreationParameters = {
                fromTime: (1565314200 - 10) * 1000,
                toTime: (1565314200 + 15000) * 1000,
                comment: 'VERY INTERSETING REMARK',
                externalUserId: 456,
                flagTypeId: 2,
                runNumber: 106,
                dataPassId: 1,
                dplDetectorId: 1,
            };

            const flag = await qualityControlFlagService.createForDataPass(qcFlagCreationParameters);
            delete qcFlagCreationParameters.externalUserId;
            const { fromTime, toTime } = qcFlagCreationParameters;
            delete qcFlagCreationParameters.fromTime;
            delete qcFlagCreationParameters.toTime;
            const { dataPassId } = qcFlagCreationParameters;
            delete qcFlagCreationParameters.dataPassId;
            const expectedPoperties = {
                ...qcFlagCreationParameters,
                from: fromTime,
                to: toTime,
            };

            expect(Object.entries(flag)).to.include.all.deep.members(Object.entries(expectedPoperties));

            const createFlagWithDataPass = await QualityControlFlagRepository.findOne({
                include: [{ association: 'dataPasses' }],
                where: {
                    id: flag.id,
                },
            });
            expect(createFlagWithDataPass.dataPasses.map(({ id }) => id)).to.have.all.members([dataPassId]);
        });
    });
};
