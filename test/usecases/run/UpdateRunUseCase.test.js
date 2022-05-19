/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

const { run: { UpdateRunUseCase } } = require('../../../lib/usecases');
const { dtos: { UpdateRunDto, UpdateRunByRunNumberDto } } = require('../../../lib/domain');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    const wrongId = 9999999999;

    let updaterunDto;
    let updateRunByRunNumberDto;
    beforeEach(async () => {
        updaterunDto = await UpdateRunDto.validateAsync({
            params: {
                runId: '1',
            },
            body: {
                runQuality: 'good',
            },
        });

        updaterunDto.session = {
            personid: 1,
            id: 1,
            name: 'John Doe',
        };
        updateRunByRunNumberDto = await UpdateRunByRunNumberDto.validateAsync({
            query: {
                runNumber: 54,
            },
            body: {
                lhcBeamEnergy: 232.156,
                lhcBeamMode: 'STABLE BEAMS',
                lhcBetaStar: 123e-5,
                aliceL3Current: 561.2,
                aliceDipoleCurrent: 45654.1,
                fillNumber: 1,
            },
        });
        updateRunByRunNumberDto.session = {
            personid: 1,
            id: 1,
            name: 'John Doe',
        };
    });
    describe('updates with runId parameter.', () => {
        it('Should be able to update the environment with correct values', async () => {
            const { result } = await new UpdateRunUseCase()
                .execute(updaterunDto);
            expect(result.runQuality).to.equal('good');
        });

        it('Should give an error when the id of the environment can not be found', async () => {
            updaterunDto.params.runId = wrongId;
            const { error } = await new UpdateRunUseCase()
                .execute(updaterunDto);
            expect(error.status).to.equal('400');
            expect(error.title).to.equal(`Run with this id (${wrongId}) could not be found`);
        });
    });
    describe('updates with run number', () => {
        it('Should be able to update the environment with correct values', async () => {
            const { result } = await new UpdateRunUseCase()
                .execute(updateRunByRunNumberDto);

            expect(result.runNumber).to.equal(54);
            expect(result.lhcBeamEnergy).to.equal(232.156);
            expect(result.lhcBeamMode).to.equal('STABLE BEAMS');
            expect(result.lhcBetaStar).to.equal(123e-5);
            expect(result.aliceL3Current).to.equal(561.2);
            expect(result.aliceDipoleCurrent).to.equal(45654.1);
            expect(result.fillNumber).to.equal(1);
        });

        it('Should give an error when the id of the run can not be found', async () => {
            updateRunByRunNumberDto.query.runNumber = wrongId;
            const { error } = await new UpdateRunUseCase()
                .execute(updateRunByRunNumberDto);
            expect(error.status).to.equal('400');
            expect(error.title).to.equal(`Run with this runNumber (${wrongId}) could not be found`);
        });

        it('Should give an error when the id of the lhcFill cannot be found', async () => {
            updateRunByRunNumberDto.body.fillNumber = wrongId;
            const { error } = await new UpdateRunUseCase()
                .execute(updateRunByRunNumberDto);
            expect(error.status).to.equal('400');
            expect(error.title).to.equal('LhcFill with id (\'9999999999\') could not be found');
        });
    });
};
