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
const DetectorsController = require('./detectors.controller');
const EnvironmentsController = require('./environments.controller');
const FlpsController = require('./flps.controller');
const LhcFillsController = require('./lhcFill.controller');
const LogsController = require('./logs.controller');
const RunTypesController = require('./runTypes.controller');
const RunsController = require('./runs.controller');
const StatusController = require('./status.controller');
const SubsystemsController = require('./subsystems.controller');
const TagsController = require('./tags.controller');

module.exports = {
    AttachmentsController,
    DetectorsController,
    EnvironmentsController,
    FlpsController,
    LhcFillsController,
    LogsController,
    RunTypesController,
    RunsController,
    StatusController,
    SubsystemsController,
    TagsController,
};
