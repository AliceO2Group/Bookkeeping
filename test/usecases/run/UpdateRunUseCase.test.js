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
const { GetAllLogsUseCase } = require('../../../lib/usecases/log/index.js');

const { expect } = chai;

module.exports = () => {
    const wrongId = 9999999999;
    const TIMESTAMP = 1664271988000;
    const BIG_INT_NUMBER = '99999999999999999';
    let getRunDto;
    let updateRunDto;
    let updateRunByRunNumberDto;
    beforeEach(async () => {
        updateRunDto = await UpdateRunDto.validateAsync({
            body: {
                runQuality: 'test',
                detectorsQualities: [
                    {
                        detectorId: 14,
                        quality: 'bad',
                    },
                    {
                        detectorId: 16,
                        quality: 'good',
                    },
                ],
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
                runNumber: 72,
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
                startOfDataTransfer: TIMESTAMP,
                endOfDataTransfer: TIMESTAMP,
                ctfFileCount: 30,
                ctfFileSize: BIG_INT_NUMBER,
                tfFileCount: 1234,
                tfFileSize: BIG_INT_NUMBER,
                otherFileCount: 123156132,
                otherFileSize: BIG_INT_NUMBER,
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

            updateRunDto.body.runQuality = 'bad';
            const { result, error } = await new UpdateRunUseCase().execute(updateRunDto);

            expect(error).to.be.an('undefined');
            expect(result).to.be.an('object');
            expect(result.id).to.equal(106);
            expect(result.runQuality).to.equal('bad');
        });

        it('should successfully create a log when run quality change', async () => {
            const { logs } = await new GetAllLogsUseCase().execute({ query: { page: { offset: 0, limit: 1 } } });
            expect(logs).to.have.lengthOf(1);
            const [log] = logs;
            expect(log.title).to.equal('Run 106 quality has changed to bad');
            expect(log.text.startsWith('The run quality for run 106 has been changed from good to bad on ')).to.be.true;
            expect(log.runs.map(({ runNumber }) => runNumber)).to.eql([106]);
            expect(log.tags.map(({ text }) => text)).to.eql(['DPG', 'RC']);
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
            const runId = 1;
            updateRunDto.params.runId = runId;
            updateRunDto.body.tags = ['FOOD', 'DO-NOT-EXIST', 'DO-NOT-EXIST-EITHER'];
            const originalRun = await new GetRunUseCase().execute({ params: { runId: runId } });

            const { result, error } = await new UpdateRunUseCase().execute(updateRunDto);

            expect(result).to.be.undefined;
            expect(error).to.be.an('object');
            expect(error.status).to.equal(500);
            expect(error.detail).to.equal('Tags DO-NOT-EXIST, DO-NOT-EXIST-EITHER could not be found');

            // Expect run to have other fields unchanged
            const run = await new GetRunUseCase().execute({ params: { runId: runId } });
            for (const property in run) {
                expect(run[property]).to.eql(originalRun[property]);
            }
        });
    });
    describe('updates with run number', () => {
        it('Should be able to update the environment with correct values', async () => {
            const { result } = await new UpdateRunUseCase()
                .execute(updateRunByRunNumberDto);

            expect(result.runNumber).to.equal(72);
            expect(result.lhcBeamEnergy).to.equal(232.156);
            expect(result.lhcBeamMode).to.equal('STABLE BEAMS');
            expect(result.lhcBetaStar).to.equal(123e-5);
            expect(result.aliceL3Polarity).to.equal('POSITIVE');
            expect(result.aliceDipoleCurrent).to.equal(45654.1);
            expect(result.aliceDipolePolarity).to.equal('NEGATIVE');
            expect(result.fillNumber).to.equal(1);
            expect(result.startOfDataTransfer).to.equal(TIMESTAMP);
            expect(result.endOfDataTransfer).to.equal(TIMESTAMP);
            expect(result.ctfFileCount).to.equal(30);
            expect(result.ctfFileSize).to.equal(BIG_INT_NUMBER);
            expect(result.tfFileCount).to.equal(1234);
            expect(result.tfFileSize).to.equal(BIG_INT_NUMBER);
            expect(result.otherFileCount).to.equal(123156132);
            expect(result.otherFileSize).to.equal(BIG_INT_NUMBER);
        });

        it('Should give an error when the id of the run can not be found', async () => {
            updateRunByRunNumberDto.query.runNumber = wrongId;
            const { error } = await new UpdateRunUseCase()
                .execute(updateRunByRunNumberDto);
            expect(error.status).to.equal(500);
            expect(error.detail).to.equal(`Run with this run number (${wrongId}) could not be found`);
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
