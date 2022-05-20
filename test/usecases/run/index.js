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

const EndRunUseCase = require('./EndRunUseCase.test');
const GetAllReasonTypesUseCase = require('./GetAllReasonTypesUseCase.test');
const GetAllRunsUseCase = require('./GetAllRunsUseCase.test');
const GetRunUseCase = require('./GetRunUseCase.test');
const UpdateRunUseCase = require('./UpdateRunUseCase.test');
const StartRunUseCase = require('./StartRunUseCase.test');
const UpdateRunUseCase = require('./UpdateRunUseCase.test');

module.exports = () => {
    describe('GetAllReasonTypesUseCase', GetAllReasonTypesUseCase);
    describe('GetAllRunsUseCase', GetAllRunsUseCase);
    describe('GetRunUseCase', GetRunUseCase);
    describe('UpdateRunUseCase', UpdateRunUseCase);
    describe('EndRunUseCase', EndRunUseCase);
    describe('StartRunUseCase', StartRunUseCase);
};
