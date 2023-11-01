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

const { expect } = require('chai');
const request = require('supertest');
const { server } = require('../../lib/application');
const { resetDatabaseContent } = require('../utilities/resetDatabaseContent.js');
const { RunQualities } = require('../../lib/domain/enums/RunQualities.js');
const { RunDetectorQualities } = require('../../lib/domain/enums/RunDetectorQualities.js');
const { RunCalibrationStatus } = require('../../lib/domain/enums/RunCalibrationStatus.js');
const { updateRun } = require('../../lib/server/services/run/updateRun.js');

module.exports = () => {
    before(resetDatabaseContent);

    describe('GET /api/v2/runs/:runNumber', () => {
        it('should return 400 if the run number is not a number', (done) => {
            request(server)
                .get('/api/v2/runs/abc')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/runNumber');
                    expect(titleError.detail).to.equal('"params.runNumber" must be a number');

                    done();
                });
        });

        it('should return 400 if the run number is not positive', (done) => {
            request(server)
                .get('/api/v2/runs/-1')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/runNumber');
                    expect(titleError.detail).to.equal('"params.runNumber" must be a positive number');

                    done();
                });
        });

        it('should return 400 if the run number is not a whole number', (done) => {
            request(server)
                .get('/api/v2/runs/0.5')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/runNumber');
                    expect(titleError.detail).to.equal('"params.runNumber" must be an integer');

                    done();
                });
        });

        it('should return 404 if the run could not be found', (done) => {
            request(server)
                .get('/api/v2/runs/999999999')
                .expect(404)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    expect(res.body.errors[0].title).to.equal('Run with this run number (999999999) could not be found');

                    done();
                });
        });

        it('should return 200 in all other cases', (done) => {
            request(server)
                .get('/api/v2/runs/1')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    expect(res.body.data.runNumber).to.equal(1);

                    done();
                });
        });

        it('should return 200 and duration when there are trigger times', (done) => {
            request(server)
                .get('/api/v2/runs/106')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    const { data } = res.body;

                    expect(data.runDuration).to.equal(90000000);
                    expect(data.timeO2Start).to.not.equal(null);
                    expect(data.timeO2End).to.not.equal(null);
                    expect(data.timeTrgStart).to.not.equal(null);
                    expect(data.timeTrgEnd).to.not.equal(null);
                    done();
                });
        });
        it('should return 200 and values \'0\' for 0 file size values', (done) => {
            request(server)
                .get('/api/v2/runs/3')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    const { data } = res.body;

                    expect(data.tfFileSize).to.equal('0');
                    expect(data.otherFileSize).to.equal('0');
                    expect(data.ctfFileSize).to.equal('0');
                    done();
                });
        });
        it('should return 200 whenever there is only a trigger start', (done) => {
            request(server)
                .get('/api/v2/runs/104')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    const { data } = res.body;

                    expect(data.timeO2Start).to.not.equal(null);
                    expect(data.timeO2End).to.not.equal(null);
                    expect(data.timeTrgStart).to.equal(null);
                    expect(data.timeTrgEnd).to.not.equal(null);
                    done();
                });
        });

        it('should return 200 and a duration with no trigger end', (done) => {
            request(server)
                .get('/api/v2/runs/103')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    const { data } = res.body;

                    expect(data.runDuration).to.equal(3600000);
                    expect(data.timeO2Start).to.not.equal(null);
                    expect(data.timeO2End).to.not.equal(null);
                    expect(data.timeTrgStart).to.not.equal(null);
                    expect(data.timeTrgEnd).to.equal(null);
                    done();
                });
        });
        it('should return 200 and a time when only o2 times are given', (done) => {
            request(server)
                .get('/api/v2/runs/102')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    const { data } = res.body;

                    expect(data.runDuration).to.equal(3600000);
                    expect(data.timeO2Start).to.not.equal(null);
                    expect(data.timeO2End).to.not.equal(null);
                    expect(data.timeTrgStart).to.equal(null);
                    expect(data.timeTrgEnd).to.equal(null);

                    done();
                });
        });
    });

    describe('GET /api/v2/runs/:runNumber/logs', () => {
        it('should return 400 if the run number is not a number', (done) => {
            request(server)
                .get('/api/v2/runs/abc/logs')
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    const titleError = errors.find((err) => err.source.pointer === '/data/attributes/params/runNumber');
                    expect(titleError.detail).to.equal('"params.runNumber" must be a number');

                    done();
                });
        });

        it('should return 404 if the run could not be found', (done) => {
            request(server)
                .get('/api/v2/runs/999999999/logs')
                .expect(404)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    expect(res.body.errors[0].title).to.equal('Run with this run number (999999999) could not be found');

                    done();
                });
        });

        it('should return 200 in all other cases', (done) => {
            request(server)
                .get('/api/v2/runs/1/logs')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(4);

                    expect(res.body.data[0].id).to.equal(1);
                    expect(res.body.data[0].runs).to.deep.equal([
                        {
                            id: 1,
                            runNumber: 1,
                        },
                    ]);
                    done();
                });
        });
    });

    describe('PUT /api/v2/runs/:runNumber', () => {
        it('should return 500 when run could not be found', (done) => {
            request(server)
                .put('/api/v2/runs/9999999999')
                .send({
                    runQuality: RunQualities.BAD,
                })
                .expect(500)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    expect(res.body.errors[0].detail).to.equal('Run with this run number (9999999999) could not be found');

                    done();
                });
        });
        it('should return 201 in all other cases', (done) => {
            request(server)
                .put('/api/v2/runs/1')
                .send({
                    runQuality: RunQualities.BAD,
                })
                .expect(201)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    expect(res.body.data.runQuality).to.equal(RunQualities.BAD);
                    done();
                });
        });

        it('should successfully return the updated run entity with new runQuality value', async () => {
            const { body } = await request(server)
                .put('/api/v2/runs/1')
                .expect(201)
                .send({ runQuality: RunQualities.GOOD, runQualityChangeReason: 'Justification' });
            expect(body.data).to.be.an('object');
            expect(body.data.runNumber).to.equal(1);
            expect(body.data.runQuality).to.equal(RunQualities.GOOD);
        });

        it('should return an error due to invalid runQuality value', async () => {
            const { body } = await request(server)
                .put('/api/v2/runs/1')
                .expect(400)
                .send({ runQuality: 'wrong', runQualityChangeReason: 'Justification' });
            expect(body.errors).to.be.an('array');
            expect(body.errors[0].detail).to.equal('"body.runQuality" must be one of [good, bad, test, none]');
        });

        it('should return 500 when trying to update the run quality without justification', async () => {
            const { body, status } = await request(server)
                .put('/api/v2/runs/1')
                .send({ runQuality: RunQualities.BAD });
            expect(status).to.equal(500);
            expect(body.errors[0].detail).to.equal('Run quality change require a reason');
        });

        it('should return 500 when trying to update the run quality with an empty justification', async () => {
            const { body, status } = await request(server)
                .put('/api/v2/runs/1')
                .send({ runQuality: RunQualities.BAD });
            expect(status).to.equal(500);
            expect(body.errors[0].detail).to.equal('Run quality change require a reason');
        });

        it('should successfully return the updated run entity with new runQuality value', async () => {
            const { body } = await request(server)
                .put('/api/v2/runs/106')
                .expect(201)
                .send({ runQuality: RunQualities.GOOD });
            expect(body.data).to.be.an('object');
            expect(body.data.runNumber).to.equal(106);
            expect(body.data.runQuality).to.equal(RunQualities.GOOD);
        });

        it('should successfully add eorReasons to run and check runQuality did not change', async () => {
            const currentRun = await request(server)
                .get('/api/v2/runs/106')
                .expect(200);
            expect(currentRun.body.data).to.be.an('object');
            expect(currentRun.body.data.runNumber).to.equal(106);
            expect(currentRun.body.data.runQuality).to.equal(RunQualities.GOOD);
            expect(currentRun.body.data.eorReasons).to.have.lengthOf(0);

            const { body } = await request(server)
                .put('/api/v2/runs/106')
                .expect(201)
                .send({
                    eorReasons: [
                        {
                            reasonTypeId: 1,
                            description: 'Some',
                        },
                    ],
                });
            expect(body.data).to.be.an('object');
            expect(body.data.runNumber).to.equal(106);
            expect(body.data.eorReasons).to.have.lengthOf(1);
            expect(body.data.eorReasons[0].description).to.equal('Some');
            expect(body.data.runQuality).to.equal(RunQualities.GOOD);
        });

        it('should give a proper error when a detectorId does not exists', async () => {
            const { body } = await request(server)
                .put('/api/v2/runs/1')
                .expect(500)
                .send({
                    detectorsQualities: [
                        {
                            detectorId: 1,
                            quality: RunDetectorQualities.BAD,
                        },
                        {
                            detectorId: 32,
                            quality: RunDetectorQualities.BAD,
                        },
                    ],
                    detectorsQualitiesChangeReason: 'Justification',
                });
            expect(body.errors[0].detail).to.equal('This run\'s detector with runNumber: (1) and with detector Id: (32) could not be found');
        });

        it('should successfully return the updated run entity with new detector\'s run quality', async () => {
            const { body, status } = await request(server)
                .put('/api/v2/runs/1')
                .send({
                    detectorsQualities: [{ detectorId: 1, quality: RunDetectorQualities.GOOD }],
                    detectorsQualitiesChangeReason: 'Justification',
                });
            expect(status).to.equal(201);
            expect(body.data).to.be.an('object');
            expect(body.data.runNumber).to.equal(1);
            expect(body.data.detectorsQualities).to.lengthOf(1);
            expect(body.data.detectorsQualities[0].id).to.equal(1);
            expect(body.data.detectorsQualities[0].quality).to.equal(RunDetectorQualities.GOOD);
        });

        it('should return 500 when trying to update the detector\'s quality of a run that has not ended yet', async () => {
            const { body, status } = await request(server)
                .put('/api/v2/runs/105')
                .send({
                    detectorsQualities: [{ detectorId: 1, quality: RunDetectorQualities.GOOD }],
                    detectorsQualitiesChangeReason: 'Justification',
                });
            expect(status).to.equal(500);
            expect(body.errors[0].detail).to.equal('Detector quality can not be updated on a run that has not ended yet');
        });

        it('should return 500 when trying to update the detector\'s quality without justification', async () => {
            const { body, status } = await request(server)
                .put('/api/v2/runs/1')
                .send({ detectorsQualities: [{ detectorId: 1, quality: RunDetectorQualities.GOOD }] });
            expect(status).to.equal(500);
            expect(body.errors[0].detail).to.equal('Detector quality change reason is required when updating detector quality');
        });

        it('should return 500 when trying to update the detector\'s quality with an empty justification', async () => {
            const { body, status } = await request(server)
                .put('/api/v2/runs/1')
                .send({ detectorsQualities: [{ detectorId: 1, quality: RunDetectorQualities.GOOD }], detectorsQualitiesChangeReason: '     ' });
            expect(status).to.equal(500);
            expect(body.errors[0].detail).to.equal('Detector quality change reason is required when updating detector quality');
        });

        it('should successfully allow to update calibration status for calibration run', async () => {
            const { body, status } = await request(server)
                .put('/api/v2/runs/40')
                .send({ calibrationStatus: RunCalibrationStatus.SUCCESS });
            expect(status).to.equal(201);
            expect(body.data).to.be.an('object');
            expect(body.data.runNumber).to.equal(40);
            expect(body.data.calibrationStatus).to.equal(RunCalibrationStatus.SUCCESS);
        });

        it('should successfully return 500 when trying to set calibration status for non-calibration run', async () => {
            const { body, status } = await request(server)
                .put('/api/v2/runs/106')
                .send({ calibrationStatus: RunCalibrationStatus.SUCCESS });
            expect(status).to.equal(500);
            expect(body.errors[0].detail).to.equal('Calibration status is reserved to calibration runs');
        });

        it('should successfully return 500 when trying to set calibration status change reason for non-failed calibration', async () => {
            const { body, status } = await request(server)
                .put('/api/v2/runs/40')
                .send({ calibrationStatus: RunCalibrationStatus.NO_STATUS, calibrationStatusChangeReason: 'A spurious reason' });
            expect(status).to.equal(500);
            expect(body.errors[0].detail)
                .to.equal(`Calibration status change reason can only be specified when changing from/to ${RunCalibrationStatus.FAILED}`);
        });

        it('should successfully return 500 when trying to set calibration status to FAILED without reason', async () => {
            const { body, status } = await request(server)
                .put('/api/v2/runs/40')
                .send({ calibrationStatus: RunCalibrationStatus.FAILED });
            expect(status).to.equal(500);
            expect(body.errors[0].detail)
                .to.equal(`Calibration status change require a reason when changing from/to ${RunCalibrationStatus.FAILED}`);
        });

        it('should successfully return 500 when trying to set calibration status to FAILED with an empty', async () => {
            const { body, status } = await request(server)
                .put('/api/v2/runs/40')
                .send({ calibrationStatus: RunCalibrationStatus.FAILED, calibrationStatusChangeReason: '      ' });
            expect(status).to.equal(500);
            expect(body.errors[0].detail)
                .to.equal(`Calibration status change require a reason when changing from/to ${RunCalibrationStatus.FAILED}`);
        });

        it('should successfully return 500 when trying to set calibration status from FAILED without reason', async () => {
            await updateRun(
                { runNumber: 40 },
                { runPatch: { calibrationStatus: RunCalibrationStatus.FAILED }, metadata: { calibrationStatusChangeReason: 'A reason' } },
            );
            const { body, status } = await request(server)
                .put('/api/v2/runs/40')
                .send({ calibrationStatus: RunCalibrationStatus.SUCCESS });
            expect(status).to.equal(500);
            expect(body.errors[0].detail)
                .to.equal(`Calibration status change require a reason when changing from/to ${RunCalibrationStatus.FAILED}`);
        });

        it('should successfully return 500 when trying to set calibration status from FAILED with an empty reason', async () => {
            const { body, status } = await request(server)
                .put('/api/v2/runs/40')
                .send({ calibrationStatus: RunCalibrationStatus.SUCCESS, calibrationStatusChangeReason: '    ' });
            expect(status).to.equal(500);
            expect(body.errors[0].detail)
                .to.equal(`Calibration status change require a reason when changing from/to ${RunCalibrationStatus.FAILED}`);
        });
    });
};
