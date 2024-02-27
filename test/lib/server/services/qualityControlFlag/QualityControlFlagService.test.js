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
const { getAllQualityControlFlagFlagTypes } = require('../../../../../lib/server/services/qualityControlFlag/getAllQualityControlFlagTypes.js');

const QCFlagTypeSchema = Joi.object({
    id: Joi.number().required(),
    name: Joi.string().required(),
    method: Joi.string().required(),
    bad: Joi.boolean().required(),
    obsolate: Joi.boolean().required(),
});

const UserSchema = Joi.object({ id: Joi.number().required(), name: Joi.string().required(), externalId: Joi.number().required() });

const QCFlagSchema = Joi.object({
    id: Joi.number().required(),
    from: Joi.number().required(),
    to: Joi.number().required(),
    comment: Joi.string().required(),
    createdAt: Joi.number().required(),

    runNumber: Joi.number().required(),
    detectorId: Joi.number().required(),

    userId: Joi.number().required(),
    user: UserSchema,
    flagTypeId: Joi.number().required(),
    flagType: QCFlagTypeSchema,
});

module.exports = () => {
    before(resetDatabaseContent);
    after(resetDatabaseContent);

    describe('Fetching quality control flags reasons', () => {
        it('should successfuly fetch quality control flags reasons', async () => {
            const flagTypes = await getAllQualityControlFlagFlagTypes();
            expect(flagTypes).to.be.an('array');
            expect(flagTypes).to.be.lengthOf(5);
            expect(flagTypes).to.have.all.deep.members([
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
                from: 1647924400000,
                to: 1647924400000,
                comment: 'Some qc comment 4',
                runNumber: 1,
                detectorId: 1,
                userId: 2,
                user: { id: 2, externalId: 456, name: 'Jan Jansen' },
                flagTypeId: 13,
                flagType: { id: 13, name: 'Bad', method: 'Bad', bad: true, obsolate: false },
                createdAt: 1707825436 * 1000,
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
