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

const AttachmentAdapter = require('./AttachmentAdapter');
const DetectorAdapter = require('./DetectorAdapter');
const EnvironmentAdapter = require('./EnvironmentAdapter');
const EorReasonAdapter = require('./EorReasonAdapter');
const FlpAdapter = require('./FlpAdapter');
const FlpRunsAdapter = require('./FlpRunsAdapter');
const LogAdapter = require('./LogAdapter');
const LogRunsAdapter = require('./LogRunsAdapter');
const LogTagsAdapter = require('./LogTagsAdapter');
const ReasonTypeAdapter = require('./ReasonTypeAdapter');
const RunAdapter = require('./RunAdapter');
const LhcFillAdapter = require('./LhcFillAdapter');
const SubsystemAdapter = require('./SubsystemAdapter');
const TagAdapter = require('./TagAdapter');
const UserAdapter = require('./UserAdapter');
const RunTypeAdapter = require('./RunTypeAdapter');

module.exports = {
    AttachmentAdapter,
    DetectorAdapter,
    EnvironmentAdapter,
    EorReasonAdapter,
    FlpAdapter,
    FlpRunsAdapter,
    LhcFillAdapter,
    LogAdapter,
    LogRunsAdapter,
    LogTagsAdapter,
    ReasonTypeAdapter,
    RunAdapter,
    RunTypeAdapter,
    SubsystemAdapter,
    TagAdapter,
    UserAdapter,
};
