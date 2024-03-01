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
                    detectorIds: [1],
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
};
