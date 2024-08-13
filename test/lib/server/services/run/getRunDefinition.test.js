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
const { getRunDefinition } = require('../../../../../lib/server/services/run/getRunDefinition.js');
const { PHYSICS, COSMICS, COMMISSIONING, TECHNICAL, SYNTHETIC, CALIBRATION } = require('./../../../../mocks/mock-run.js');
const { RunDefinition } = require('../../../../../lib/domain/enums/RunDefinition.js');

module.exports = () => {
    it('should successfully identify runs as PHYSICS', () => {
        expect(getRunDefinition(PHYSICS.processingAndITSAndFT0)).to.equal(RunDefinition.PHYSICS);
        expect(getRunDefinition(PHYSICS.processingAndFT0AndITS)).to.equal(RunDefinition.PHYSICS);
        expect(getRunDefinition(PHYSICS.processingDiskAndFT0AndITS)).to.equal(RunDefinition.PHYSICS);
        expect(getRunDefinition(PHYSICS.processingDiskAndITSAndFT0)).to.equal(RunDefinition.PHYSICS);
    });

    it('should successfully identify runs as COSMICS', () => {
        expect(getRunDefinition(COSMICS.stableBeamOverlapAndNoDetector)).to.equal(RunDefinition.COSMICS);
        expect(getRunDefinition(COSMICS.stableBeamOverlapAndNoDetectorAndNoBeam)).to.equal(RunDefinition.COSMICS);
    });

    it('should successfully identify runs as COMMISSIONING', () => {
        expect(getRunDefinition(COMMISSIONING.standalone)).to.equal(RunDefinition.COMMISSIONING);
        expect(getRunDefinition(COMMISSIONING.noStableBeamOverlap)).to.equal(RunDefinition.COMMISSIONING);
    });

    it('should successfully identify runs as TECHNICAL', () => {
        expect(getRunDefinition(TECHNICAL.standalone)).to.equal(RunDefinition.TECHNICAL);
    });

    it('should successfully identify runs as SYNTHETIC', () => {
        expect(getRunDefinition(SYNTHETIC.PP)).to.equal(RunDefinition.SYNTHETIC);
        expect(getRunDefinition(SYNTHETIC.PBPB)).to.equal(RunDefinition.SYNTHETIC);
    });

    it('should successfully identify runs as CALIBRATION', () => {
        expect(getRunDefinition(CALIBRATION.PEDESTAL)).to.equal(RunDefinition.CALIBRATION);
        expect(getRunDefinition(CALIBRATION.LASER)).to.equal(RunDefinition.CALIBRATION);
        expect(getRunDefinition(CALIBRATION.PULSER)).to.equal(RunDefinition.CALIBRATION);
        expect(getRunDefinition(CALIBRATION.NOISE)).to.equal(RunDefinition.CALIBRATION);
    });
};
