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
const FlpRoleAdapter = require('./FlpRoleAdapter');
const LogAdapter = require('./LogAdapter');
const LogRunsAdapter = require('./LogRunsAdapter');
const LogTagsAdapter = require('./LogTagsAdapter');
const ReasonTypeAdapter = require('./ReasonTypeAdapter');
const RunTypeAdapter = require('./RunTypeAdapter');
const SubsystemAdapter = require('./SubsystemAdapter');
const TagAdapter = require('./TagAdapter');
const UserAdapter = require('./UserAdapter');
const { LhcFillAdapter } = require('./LhcFillAdapter.js');
const { RunAdapter } = require('./RunAdapter.js');
const RunDetectorsAdapter = require('./RunDetectorsAdapter');

const attachmentAdapter = new AttachmentAdapter();
const detectorAdapter = new DetectorAdapter();
const environmentAdapter = new EnvironmentAdapter();
const eorReasonAdapter = new EorReasonAdapter();
const flpRoleAdapter = new FlpRoleAdapter();
const logAdapter = new LogAdapter();
const logRunsAdapter = new LogRunsAdapter();
const logTagsAdapter = new LogTagsAdapter();
const reasonTypeAdapter = new ReasonTypeAdapter();
const runTypeAdapter = new RunTypeAdapter();
const runDetectorsAdapter = new RunDetectorsAdapter();
const subsystemAdapter = new SubsystemAdapter();
const tagAdapter = new TagAdapter();
const userAdapter = new UserAdapter();
const lhcFillAdapter = new LhcFillAdapter();
const runAdapter = new RunAdapter();

// Fill dependencies
environmentAdapter.runAdapter = runAdapter;

eorReasonAdapter.reasonTypeAdapter = reasonTypeAdapter;

flpRoleAdapter.runAdapter = runAdapter;

lhcFillAdapter.runAdapter = runAdapter;

logAdapter.runAdapter = runAdapter;
logAdapter.attachmentAdapter = attachmentAdapter;
logAdapter.subsystemAdapter = subsystemAdapter;
logAdapter.tagAdapter = tagAdapter;
logAdapter.userAdapter = userAdapter;

runAdapter.tagAdapter = tagAdapter;
runAdapter.eorReasonAdapter = eorReasonAdapter;
runAdapter.runTypeAdapter = runTypeAdapter;
runAdapter.lhcFillAdapter = lhcFillAdapter;
runAdapter.flpRoleAdapter = flpRoleAdapter;

module.exports = {
    attachmentAdapter,
    detectorAdapter,
    environmentAdapter,
    eorReasonAdapter,
    flpRoleAdapter,
    logAdapter,
    logRunsAdapter,
    logTagsAdapter,
    reasonTypeAdapter,
    runTypeAdapter,
    runDetectorsAdapter,
    subsystemAdapter,
    tagAdapter,
    userAdapter,
    lhcFillAdapter,
    runAdapter,
};
