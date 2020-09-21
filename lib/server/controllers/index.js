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

const AttachmentsController = require('./attachments.controller');
const AuthController = require('./auth.controller');
const CreatepdfController = require('./createpdf.controller');
const FlpsController = require('./flps.controller');
const HomeController = require('./home.controller');
const LogsController = require('./logs.controller');
const OverviewsController = require('./overviews.controller');
const RunsController = require('./runs.controller');
const SettingsController = require('./settings.controller');
const SubsystemsController = require('./subsystems.controller');
const TagsController = require('./tags.controller');
const UsersController = require('./users.controller');

module.exports = {
    AttachmentsController,
    AuthController,
    CreatepdfController,
    FlpsController,
    HomeController,
    LogsController,
    OverviewsController,
    RunsController,
    SettingsController,
    SubsystemsController,
    TagsController,
    UsersController,
};
