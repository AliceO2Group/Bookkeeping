/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

const { resetDatabaseContent } = require('../../../../utilities/resetDatabaseContent.js');
const DplProcessServiceTest = require('./DplProcessService.test.js');
const GetDplDetectorsTest = require('./getAllDplDetectors.test.js');

module.exports = () => {
    before(resetDatabaseContent);
    describe('DplProcessService', DplProcessServiceTest);
    describe('Get All DplDetectors', GetDplDetectorsTest);
};
