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
const LogAdapter = require('./LogAdapter');
const LogTagsAdapter = require('./LogTagsAdapter');
const RunAdapter = require('./RunAdapter');
const FlpAdapter = require('./FlpAdapter');
const SubsystemAdapter = require('./SubsystemAdapter');
const TagAdapter = require('./TagAdapter');
const UserAdapter = require('./UserAdapter');
const LogRunsAdapter = require('./LogRunsAdapter');
const FlpRunsAdapter = require('./FlpRunsAdapter');

module.exports = {
    AttachmentAdapter,
    LogAdapter,
    LogTagsAdapter,
    RunAdapter,
    FlpAdapter,
    SubsystemAdapter,
    TagAdapter,
    UserAdapter,
    LogRunsAdapter,
    FlpRunsAdapter,
};
