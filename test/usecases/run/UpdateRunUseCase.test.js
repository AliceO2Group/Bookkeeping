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

const { run: { UpdateRunUseCase, GetRunUseCase } } = require('../../../lib/usecases');
const { dtos: { UpdateRunDto, GetRunDto, UpdateRunByRunNumberDto } } = require('../../../lib/domain');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    const wrongId = 9999999999;

    let getRunDto;
    let updateRunDto;
    let updateRunByRunNumberDto;
    beforeEach(async () => {
        updateRunDto = await UpdateRunDto.validateAsync({
            body: {
                runQuality: 'test',
            },
            params: {
                runId: 106,
            },
        });
        getRunDto = await GetRunDto.validateAsync({
            params: {
                runId: 106,
            },
        });

        updateRunByRunNumberDto = await UpdateRunByRunNumberDto.validateAsync({
            query: {
                runNumber: 54,
            },
            body: {
                lhcBeamEnergy: 232.156,
                lhcBeamMode: 'STABLE BEAMS',
                lhcBetaStar: 123e-5,
                aliceL3Current: 561.2,
                aliceL3Polarity: 'POSITIVE',
                aliceDipoleCurrent: 45654.1,
                aliceDipolePolarity: 'NEGATIVE',
                fillNumber: 1,
            },
        });
    });
    describe('updates with runId parameter.', () => {
        it('Should give an error when the id of the environment can not be found', async () => {
            updateRunDto.params.runId = wrongId;
            const { error } = await new UpdateRunUseCase()
                .execute(updateRunDto);
            expect(error.status).to.equal(500);
            expect(error.detail).to.equal(`Run with this id (${wrongId}) could not be found`);
        });
        it('should successfully retrieve run via ID, store and return the new run with runQuality passed as to update fields', async () => {
            const run = await new GetRunUseCase().execute(getRunDto);
            expect(run).to.be.an('object');
            expect(run.id).to.equal(106);
            expect(run.runQuality).to.equal('good');

            const { result, error } = await new UpdateRunUseCase().execute(updateRunDto);

            expect(error).to.be.an('undefined');
            expect(result).to.be.an('object');
            expect(result.id).to.equal(106);
            expect(result.runQuality).to.equal('test');
        });

        it('should successfully retrieve run via ID, store and return the new run with eorReasons passed as to update fields', async () => {
            getRunDto.params.runId = 1;
            const run = await new GetRunUseCase().execute(getRunDto);
            expect(run).to.be.an('object');
            expect(run.id).to.equal(1);
            expect(run.eorReasons).to.have.lengthOf(2);
            expect(run.eorReasons[0].description).to.equal('Some Reason other than selected');

            updateRunDto.params.runId = 1;

            /*
             * EorReasons with ID should be kept, those without ID should be inserted, existing EoRReasons in entry not matching
             * this condition should be removed
             */
            updateRunDto.body = {
                eorReasons: [
                    {
                        runId: 1,
                        reasonTypeId: 1,
                        lastEditedName: 'Anonymous',
                    },
                    {
                        id: 2,
                        title: 'DETECTORS',
                        category: 'CPV',
                        description: 'Some Reason other than selected',
                        runId: 1,
                        reasonTypeId: 1,
                        lastEditedName: 'Anonymous',
                    },
                ],
            };
            const { result, error } = await new UpdateRunUseCase().execute(updateRunDto);

            expect(error).to.be.an('undefined');
            expect(result).to.be.an('object');
            expect(result.id).to.equal(1);
            expect(result.eorReasons).to.have.lengthOf(2);
            expect(result.eorReasons[0].id).to.equal(2);
            expect(result.eorReasons[0].description).to.equal('Some Reason other than selected plus one');
            expect(result.eorReasons[1].id).to.equal(6);
            expect(result.eorReasons[1].description).to.be.null;
        });

        it('should return error if eor reasons do not match runId', async () => {
            updateRunDto.params.runId = 10;
            updateRunDto.body = {
                eorReasons: [
                    {
                        description: 'Something went wrong',
                        runId: 1,
                        reasonTypeId: 1,
                        lastEditedName: 'Anonymous',
                    },
                ],
            };
            const { result, error } = await new UpdateRunUseCase().execute(updateRunDto);

            expect(result).to.be.an('undefined');

            expect(error).to.be.an('object');
            expect(error.status).to.equal(500);
            expect(error.detail).to.equal('Multiple run ids parameters passed in eorReasons list. Please send updates for one run only');
        });

        it('should return error if eor reasons contain different runIds', async () => {
            updateRunDto.params.runId = 1;
            updateRunDto.body = {
                eorReasons: [
                    {
                        description: 'Something went wrong',
                        runId: 1,
                        reasonTypeId: 1,
                        lastEditedName: 'Anonymous',
                    },
                    {
                        description: 'Something went wrong',
                        runId: 2,
                        reasonTypeId: 1,
                        lastEditedName: 'Anonymous',
                    },
                ],
            };
            const { result, error } = await new UpdateRunUseCase().execute(updateRunDto);

            expect(result).to.be.an('undefined');

            expect(error).to.be.an('object');
            expect(error.status).to.equal(500);
            expect(error.detail).to.equal('Multiple run ids parameters passed in eorReasons list. Please send updates for one run only');
        });

        it('should return error if eor reasons contains reason_type_id that does not exist', async () => {
            updateRunDto.params.runId = 1;
            updateRunDto.body = {
                eorReasons: [
                    {
                        description: 'Something went wrong',
                        runId: 1,
                        reasonTypeId: 10,
                        lastEditedName: 'Anonymous',
                    },
                ],
            };
            const { result, error } = await new UpdateRunUseCase().execute(updateRunDto);

            expect(result).to.be.an('undefined');

            expect(error).to.be.an('object');
            expect(error.status).to.equal(500);
            expect(error.detail).to.equal('Provided reason types do not exist');
        });

        it('Should successfully update the run tags', async () => {
            updateRunDto.body.tags = ['TEST-TAG-1', 'TEST-TAG-2'];
            const { result, error } = await new UpdateRunUseCase().execute(updateRunDto);

            expect(error).to.be.undefined;
            expect(result.tags.map((tag) => tag.text)).to.be.eql(['TEST-TAG-1', 'TEST-TAG-2']);
        });

        it('should throw an error when the at least one of the given tag do not exists', async () => {
            updateRunDto.params.runId = 1;
            updateRunDto.body.tags = ['FOOD', 'DO-NOT-EXIST', 'DO-NOT-EXIST-EITHER'];

            const { result, error } = await new UpdateRunUseCase().execute(updateRunDto);

            expect(result).to.be.undefined;
            expect(error).to.be.an('object');
            expect(error.status).to.equal(500);
            expect(error.detail).to.equal('Tags DO-NOT-EXIST, DO-NOT-EXIST-EITHER could not be found');
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
            expect(result.aliceL3Polarity).to.equal('POSITIVE');
            expect(result.aliceDipoleCurrent).to.equal(45654.1);
            expect(result.aliceDipolePolarity).to.equal('NEGATIVE');
            expect(result.fillNumber).to.equal(1);
        });

        it('Should give an error when the id of the run can not be found', async () => {
            updateRunByRunNumberDto.query.runNumber = wrongId;
            const { error } = await new UpdateRunUseCase()
                .execute(updateRunByRunNumberDto);
            expect(error.status).to.equal(500);
            expect(error.detail).to.equal(`Run with this runNumber (${wrongId}) could not be found`);
        });

        it('Should give an error when the id of the lhcFill cannot be found', async () => {
            updateRunByRunNumberDto.body.fillNumber = wrongId;
            const { error } = await new UpdateRunUseCase()
                .execute(updateRunByRunNumberDto);
            expect(error.status).to.equal(500);
            expect(error.detail).to.equal('LhcFill with id (\'9999999999\') could not be found');
        });
    });
};
