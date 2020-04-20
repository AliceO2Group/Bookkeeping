/**
 * This file is part of the ALICE Electronic Logbook v2, also known as Jiskefet.
 * Copyright (C) 2020  Stichting Hogeschool van Amsterdam
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const AttachmentsController = require('./attachments.controller');
const CreatepdfController = require('./createpdf.controller');
const FlpController = require('./flp.controller');
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
    CreatepdfController,
    FlpController,
    HomeController,
    LogsController,
    OverviewsController,
    RunsController,
    SettingsController,
    SubsystemsController,
    TagsController,
    UsersController,
};
