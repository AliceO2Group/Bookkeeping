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

const { run: { UpdateRunUseCase, GetRunUseCase } } = require('../../../../lib/usecases/index.js');
const { dtos: { UpdateRunDto, GetRunDto, UpdateRunByRunNumberDto } } = require('../../../../lib/domain/index.js');
const chai = require('chai');
const { GetAllLogsUseCase } = require('../../../../lib/usecases/log/index.js');
const { RunQualities } = require('../../../../lib/domain/enums/RunQualities.js');
const { RunDetectorQualities } = require('../../../../lib/domain/enums/RunDetectorQualities.js');

const { expect } = chai;

module.exports = () => {
    const wrongRunNumber = 9999999999;
    const TIMESTAMP = 1664271988000;
    const BIG_INT_NUMBER = '99999999999999999';
    let getRunDto;
    let updateRunDto;
    let updateRunByRunNumberDto;
    beforeEach(async () => {
        updateRunDto = await UpdateRunDto.validateAsync({
            body: {},
            params: { runNumber: 106 },
        });
        getRunDto = await GetRunDto.validateAsync({
            params: { runNumber: 106 },
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
    describe('updates with runNumber parameter.', () => {
        it('Should give an error when the id of the environment can not be found', async () => {
            updateRunDto.params.runNumber = wrongRunNumber;
            const { error } = await new UpdateRunUseCase().execute(updateRunDto);
            expect(error.status).to.equal(500);
            expect(error.detail).to.equal(`Run with this run number (${wrongRunNumber}) could not be found`);
        });

        it('should successfully retrieve run via run number, \
                store and return the new run with runQuality passed as to update fields', async () => {
            const run = await new GetRunUseCase().execute(getRunDto);
            expect(run).to.be.an('object');
            expect(run.id).to.equal(106);
            expect(run.runQuality).to.equal(RunQualities.GOOD);

            updateRunDto.body.runQuality = RunQualities.BAD;
            updateRunDto.body.runQualityChangeReason = 'Change reason';
            const { result, error } = await new UpdateRunUseCase().execute(updateRunDto);

            expect(error).to.be.an('undefined');
            expect(result).to.be.an('object');
            expect(result.id).to.equal(106);
            expect(result.runQuality).to.equal(RunQualities.BAD);
        });

        it('should return error as run quality cannot be changed for ongoing runs', async () => {
            getRunDto.params.runNumber = 105;
            const run = await new GetRunUseCase().execute(getRunDto);
            expect(run).to.be.an('object');
            expect(run.id).to.equal(105);
            expect(run.runQuality).to.equal(RunQualities.GOOD);

            updateRunDto.params.runNumber = 105;
            updateRunDto.body.runQuality = RunQualities.BAD;
            updateRunDto.body.runQualityChangeReason = 'Change reason';
            const { error } = await new UpdateRunUseCase().execute(updateRunDto);

            expect(error).to.be.an('object');
            expect(error.detail).to.equal('Run quality can not be updated on a run that has not ended yet');
        });

        it('should successfully create a log when run quality change', async () => {
            const changeReason = 'Change reason';
            updateRunDto.body.runQualityChangeReason = changeReason;

            // eslint-disable-next-line require-jsdoc
            const expectLastLogToBeForQualityChange = async (previousQuality, newQuality, expectedTags) => {
                const { logs } = await new GetAllLogsUseCase().execute({ query: { page: { offset: 0, limit: 1 } } });
                expect(logs).to.have.lengthOf(1);
                const [log] = logs;
                expect(log.title).to.equal(`Run 106 quality has changed to ${newQuality}`);
                expect(log.text
                    .startsWith(`The run quality for run 106 from period LHC22b has been changed from ${previousQuality} to ${newQuality} on `))
                    .to.be.true;
                expect(log.text.endsWith(`Reason: ${changeReason}`)).to.be.true;
                expect(log.runs.map(({ runNumber }) => runNumber)).to.eql([106]);
                expect(log.tags.map(({ text }) => text)).to.eql(expectedTags);
            };

            // Log for update test
            await expectLastLogToBeForQualityChange(RunQualities.GOOD, RunQualities.BAD, ['DPG', 'RC']);

            updateRunDto.body.runQuality = RunQualities.TEST;
            await new UpdateRunUseCase().execute(updateRunDto);
            await expectLastLogToBeForQualityChange(RunQualities.BAD, RunQualities.TEST, []);

            updateRunDto.body.runQuality = RunQualities.BAD;
            await new UpdateRunUseCase().execute(updateRunDto);
            await expectLastLogToBeForQualityChange(RunQualities.TEST, RunQualities.BAD, []);

            updateRunDto.body.runQuality = RunQualities.GOOD;
            await new UpdateRunUseCase().execute(updateRunDto);
            await expectLastLogToBeForQualityChange(RunQualities.BAD, RunQualities.GOOD, ['DPG', 'RC']);

            updateRunDto.body.runQuality = RunQualities.TEST;
            await new UpdateRunUseCase().execute(updateRunDto);
            await expectLastLogToBeForQualityChange(RunQualities.GOOD, RunQualities.TEST, []);

            updateRunDto.body.runQuality = RunQualities.GOOD;
            await new UpdateRunUseCase().execute(updateRunDto);
            await expectLastLogToBeForQualityChange(RunQualities.TEST, RunQualities.GOOD, []);

            updateRunDto.body.runQuality = RunQualities.NONE;
            await new UpdateRunUseCase().execute(updateRunDto);
            await expectLastLogToBeForQualityChange(RunQualities.GOOD, RunQualities.NONE, []);

            updateRunDto.body.runQuality = RunQualities.TEST;
            await new UpdateRunUseCase().execute(updateRunDto);
            await expectLastLogToBeForQualityChange(RunQualities.NONE, RunQualities.TEST, []);

            updateRunDto.body.runQuality = RunQualities.NONE;
            await new UpdateRunUseCase().execute(updateRunDto);
            await expectLastLogToBeForQualityChange(RunQualities.TEST, RunQualities.NONE, []);

            updateRunDto.body.runQuality = RunQualities.BAD;
            await new UpdateRunUseCase().execute(updateRunDto);
            await expectLastLogToBeForQualityChange(RunQualities.NONE, RunQualities.BAD, []);
        });

        it('should successfully retrieve run via run number, \
                store and return the new run with eorReasons passed as to update fields', async () => {
            getRunDto.params.runNumber = 1;
            const run = await new GetRunUseCase().execute(getRunDto);
            expect(run).to.be.an('object');
            expect(run.id).to.equal(1);
            expect(run.eorReasons).to.have.lengthOf(2);
            expect(run.eorReasons[0].description).to.equal('Some Reason other than selected');

            updateRunDto.params.runNumber = 1;

            /*
             * EorReasons with ID should be kept, those without ID should be inserted, existing EoRReasons in entry not matching
             * this condition should be removed
             */
            updateRunDto.body = {
                eorReasons: [
                    {
                        reasonTypeId: 1,
                    },
                    {
                        id: 2,
                        reasonTypeId: 1,
                        description: 'Some Reason other than selected',
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
            expect(result.eorReasons[1].id).to.equal(7);
            expect(result.eorReasons[1].description).to.be.null;
        });

        it('Should successfully update the run tags', async () => {
            updateRunDto.body.tags = ['ECS', 'ECS Shifter'];
            const { result, error } = await new UpdateRunUseCase().execute(updateRunDto);

            expect(error).to.be.undefined;
            expect(result.tags.map((tag) => tag.text)).to.be.eql(['ECS', 'ECS Shifter']);
        });

        it('should throw an error when the at least one of the given tag do not exists', async () => {
            const runNumber = 1;
            updateRunDto.params.runNumber = runNumber;
            updateRunDto.body.tags = ['FOOD', 'DO-NOT-EXIST', 'DO-NOT-EXIST-EITHER'];
            const originalRun = await new GetRunUseCase().execute({ params: { runNumber: runNumber } });

            const { result, error } = await new UpdateRunUseCase().execute(updateRunDto);

            expect(result).to.be.undefined;
            expect(error).to.be.an('object');
            expect(error.status).to.equal(500);
            expect(error.detail).to.equal('Tags DO-NOT-EXIST, DO-NOT-EXIST-EITHER could not be found');

            // Expect run to have other fields unchanged
            const run = await new GetRunUseCase().execute({ params: { runNumber: runNumber } });
            for (const property in run) {
                expect(run[property]).to.eql(originalRun[property]);
            }
        });

        it('should successfully update the run detector\'s quality and create a log accordingly', async () => {
            const justification = 'The detector quality change justification';
            // eslint-disable-next-line require-jsdoc
            const expectLastLogToBeForDetectorQualityChange = async (newQuality) => {
                const { logs } = await new GetAllLogsUseCase().execute({ query: { page: { offset: 0, limit: 1 } } });
                expect(logs).to.have.lengthOf(1);
                const [log] = logs;
                expect(log.title).to.equal('Detector(s) quality for run 1 has been changed');
                expect(log.text.startsWith('Here are the updated detector\'s qualities for run 1')).to.be.true;
                expect(log.text.endsWith(`- CPV: ${newQuality}\nReason: ${justification}`)).to.be.true;
                expect(log.runs.map(({ runNumber }) => runNumber)).to.eql([1]);
                expect(log.tags.map(({ text }) => text)).to.eql(['CPV']);
            };

            const { result, error } = await new UpdateRunUseCase().execute({
                params: { runNumber: 1 },
                body: {
                    detectorsQualities: [{ detectorId: 1, quality: RunDetectorQualities.BAD }],
                    detectorsQualitiesChangeReason: justification,
                },
            });
            expect(error).to.be.undefined;
            expect(result).to.be.an('object');
            expect(result.detectorsQualities).to.lengthOf(1);
            expect(result.detectorsQualities[0].id).to.equal(1);
            expect(result.detectorsQualities[0].name).to.equal('CPV');
            expect(result.detectorsQualities[0].quality).to.equal(RunDetectorQualities.BAD);
            await expectLastLogToBeForDetectorQualityChange(RunDetectorQualities.BAD);

            await new UpdateRunUseCase().execute({
                params: { runNumber: 1 },
                body: {
                    detectorsQualities: [{ detectorId: 1, quality: RunDetectorQualities.GOOD }],
                    detectorsQualitiesChangeReason: justification,
                },
            });
            await expectLastLogToBeForDetectorQualityChange(RunDetectorQualities.GOOD);
        });

        it('should throw an error when trying to update the quality of a non-existing detector', async () => {
            const { result, error } = await new UpdateRunUseCase().execute({
                params: { runNumber: 1 },
                body: {
                    detectorsQualities: [{ detectorId: 2, quality: RunDetectorQualities.BAD }],
                    detectorsQualitiesChangeReason: 'Justification',
                },
            });
            expect(result).to.be.undefined;
            expect(error).to.be.an('object');
            expect(error.detail).to.equal('This run\'s detector with runNumber: (1) and with detector Id: (2) could not be found');
        });

        it('should throw an error when trying to update the quality of a run not ended yet', async () => {
            const { result, error } = await new UpdateRunUseCase().execute({
                params: { runNumber: 105 },
                body: {
                    detectorsQualities: [{ detectorId: 1, quality: RunDetectorQualities.BAD }],
                    detectorsQualitiesChangeReason: 'Justification',
                },
            });
            expect(result).to.be.undefined;
            expect(error).to.be.an('object');
            expect(error.detail).to.equal('Detector quality can not be updated on a run that has not ended yet');
        });
    });

    describe('updates with run number', () => {
        it('Should be able to update the run with correct values', async () => {
            const { result } = await new UpdateRunUseCase().execute(updateRunByRunNumberDto);

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
            updateRunByRunNumberDto.query.runNumber = wrongRunNumber;
            const { error } = await new UpdateRunUseCase()
                .execute(updateRunByRunNumberDto);
            expect(error.status).to.equal(500);
            expect(error.detail).to.equal(`Run with this run number (${wrongRunNumber}) could not be found`);
        });

        it('Should give an error when the id of the lhcFill cannot be found', async () => {
            updateRunByRunNumberDto.body.fillNumber = wrongRunNumber;
            const { error } = await new UpdateRunUseCase()
                .execute(updateRunByRunNumberDto);
            expect(error.status).to.equal(500);
            expect(error.detail).to.equal('LhcFill with id (\'9999999999\') could not be found');
        });
    });
};
