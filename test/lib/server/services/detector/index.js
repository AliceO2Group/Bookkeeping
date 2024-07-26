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

const getdetectorTest = require('./getDetector.test.js');
const createDetectorTest = require('./createDetector.test.js');
const getOrCreateAllPhysicalDetectorsTest = require('./getOrCreateAllDataTakingDetectorsByName.test.js');
const getAllDetectorsTest = require('./getAllDetectors.test.js');
const DetectorServiceTest = require('./DetectorService.test');

module.exports = () => {
    describe('getDetector', getdetectorTest);
    describe('createDetector', createDetectorTest);
    describe('getOrCreateAllPhysicalDetectors', getOrCreateAllPhysicalDetectorsTest);
    describe('getAllDetectors', getAllDetectorsTest);
    describe('DetectorService', DetectorServiceTest);
};
