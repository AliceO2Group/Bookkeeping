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

const CreateTagUseCase = require('./CreateTagUseCase.test');
const DeleteTagUseCase = require('./DeleteTagUseCase.test');
const GetAllTagsUseCase = require('./GetAllTagsUseCase.test');
const GetTagUseCase = require('./GetTagUseCase.test');
const GetNotificationUseCase = require('./GetNotificationUseCase.test');

module.exports = () => {
    describe('CreateTagUseCase', CreateTagUseCase);
    describe('DeleteTagUseCase', DeleteTagUseCase);
    describe('GetAllTagsUseCase', GetAllTagsUseCase);
    describe('GetTagUseCase', GetTagUseCase);
    describe('GetNotification', GetNotificationUseCase);
};
