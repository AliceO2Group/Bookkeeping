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
const { getRunDefinition, RunDefinition } = require('../../../../../backend/server/services/run/getRunDefinition.js');
const { PHYSICS, COSMICS, COMMISSIONING, TECHNICAL, SYNTHETIC, CALIBRATION } = require('./../../../../mocks/mock-run.js');

module.exports = () => {
    it('should successfully identify runs as PHYSICS', () => {
        expect(getRunDefinition(PHYSICS.processingAndITSAndFT0)).to.equal(RunDefinition.Physics);
        expect(getRunDefinition(PHYSICS.processingAndFT0AndITS)).to.equal(RunDefinition.Physics);
        expect(getRunDefinition(PHYSICS.processingDiskAndFT0AndITS)).to.equal(RunDefinition.Physics);
        expect(getRunDefinition(PHYSICS.processingDiskAndITSAndFT0)).to.equal(RunDefinition.Physics);
    });

    it('should successfully identify runs as COSMICS', () => {
        expect(getRunDefinition(COSMICS.stableBeamOverlapAndNoDetector)).to.equal(RunDefinition.Cosmics);
        expect(getRunDefinition(COSMICS.stableBeamOverlapAndNoDetectorAndNoBeam)).to.equal(RunDefinition.Cosmics);
    });

    it('should successfully identify runs as COMMISIONING', () => {
        expect(getRunDefinition(COMMISSIONING.standalone)).to.equal(RunDefinition.Commissioning);
        expect(getRunDefinition(COMMISSIONING.noStableBeamOverlap)).to.equal(RunDefinition.Commissioning);
    });

    it('should successfully identify runs as TECHNICAL', () => {
        expect(getRunDefinition(TECHNICAL.standalone)).to.equal(RunDefinition.Technical);
    });

    it('should successfully identify runs as SYNTHETIC', () => {
        expect(getRunDefinition(SYNTHETIC.PP)).to.equal(RunDefinition.Synthetic);
        expect(getRunDefinition(SYNTHETIC.PBPB)).to.equal(RunDefinition.Synthetic);
    });

    it('should successfully identify runs as CALIBRATION', () => {
        expect(getRunDefinition(CALIBRATION.PEDESTAL)).to.equal(RunDefinition.Calibration);
        expect(getRunDefinition(CALIBRATION.LASER)).to.equal(RunDefinition.Calibration);
        expect(getRunDefinition(CALIBRATION.PULSER)).to.equal(RunDefinition.Calibration);
        expect(getRunDefinition(CALIBRATION.NOISE)).to.equal(RunDefinition.Calibration);
    });
};
