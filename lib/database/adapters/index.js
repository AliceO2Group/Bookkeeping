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
const { DplDetectorAdapter } = require('./dpl/DplDetectorAdapter.js');
const { DplProcessExecutionAdapter } = require('./dpl/DplProcessExecutionAdapter.js');
const { DplProcessAdapter } = require('./dpl/DplProcessAdapter.js');
const { DplProcessTypeAdapter } = require('./dpl/DplProcessTypeAdapter.js');
const EnvironmentAdapter = require('./EnvironmentAdapter');
const EnvironmentHistoryItemAdapter = require('./EnvironmentHistoryItemAdapter.js');
const EorReasonAdapter = require('./EorReasonAdapter');
const FlpRoleAdapter = require('./FlpRoleAdapter');
const { HostAdapter } = require('./HostAdapter.js');
const LogAdapter = require('./LogAdapter');
const LogRunsAdapter = require('./LogRunsAdapter');
const LogTagsAdapter = require('./LogTagsAdapter');
const ReasonTypeAdapter = require('./ReasonTypeAdapter');
const RunTypeAdapter = require('./RunTypeAdapter');
const SubsystemAdapter = require('./SubsystemAdapter');
const TagAdapter = require('./TagAdapter');
const UserAdapter = require('./UserAdapter');
const { LhcFillAdapter } = require('./LhcFillAdapter.js');
const { LhcFillStatisticsAdapter } = require('./LhcFillStatisticsAdapter.js');
const { RunAdapter } = require('./RunAdapter.js');
const RunDetectorsAdapter = require('./RunDetectorsAdapter');

const attachmentAdapter = new AttachmentAdapter();
const detectorAdapter = new DetectorAdapter();
const dplDetectorAdapter = new DplDetectorAdapter();
const dplProcessExecutionAdapter = new DplProcessExecutionAdapter();
const dplProcessAdapter = new DplProcessAdapter();
const dplProcessTypeAdapter = new DplProcessTypeAdapter();
const environmentAdapter = new EnvironmentAdapter();
const environmentHistoryItemAdapter = new EnvironmentHistoryItemAdapter();
const eorReasonAdapter = new EorReasonAdapter();
const flpRoleAdapter = new FlpRoleAdapter();
const hostAdapter = new HostAdapter();
const lhcFillAdapter = new LhcFillAdapter();
const lhcFillStatisticsAdapter = new LhcFillStatisticsAdapter();
const logAdapter = new LogAdapter();
const logRunsAdapter = new LogRunsAdapter();
const logTagsAdapter = new LogTagsAdapter();
const reasonTypeAdapter = new ReasonTypeAdapter();
const runAdapter = new RunAdapter();
const runTypeAdapter = new RunTypeAdapter();
const runDetectorsAdapter = new RunDetectorsAdapter();
const subsystemAdapter = new SubsystemAdapter();
const tagAdapter = new TagAdapter();
const userAdapter = new UserAdapter();

// Fill dependencies
dplDetectorAdapter.dplProcessExecutionAdapter = dplProcessExecutionAdapter;

dplProcessExecutionAdapter.hostAdapter = hostAdapter;
dplProcessExecutionAdapter.dplDetectorAdapter = dplDetectorAdapter;
dplProcessExecutionAdapter.dplProcessAdapter = dplProcessAdapter;
dplProcessExecutionAdapter.runAdapter = runAdapter;

dplProcessAdapter.dplProcessExecutionAdapter = dplProcessExecutionAdapter;
dplProcessAdapter.dplProcessTypeAdapter = dplProcessTypeAdapter;

environmentAdapter.runAdapter = runAdapter;
environmentAdapter.environmentHistoryItemAdapter = environmentHistoryItemAdapter;

eorReasonAdapter.reasonTypeAdapter = reasonTypeAdapter;

flpRoleAdapter.runAdapter = runAdapter;

hostAdapter.dplProcessExecutionAdapter = dplProcessExecutionAdapter;

lhcFillAdapter.runAdapter = runAdapter;

logAdapter.runAdapter = runAdapter;
logAdapter.attachmentAdapter = attachmentAdapter;
logAdapter.subsystemAdapter = subsystemAdapter;
logAdapter.tagAdapter = tagAdapter;
logAdapter.userAdapter = userAdapter;
logAdapter.lhcFillAdapter = lhcFillAdapter;
logAdapter.environmentAdapter = environmentAdapter;

runAdapter.logAdapter = logAdapter;
runAdapter.tagAdapter = tagAdapter;
runAdapter.eorReasonAdapter = eorReasonAdapter;
runAdapter.runTypeAdapter = runTypeAdapter;
runAdapter.lhcFillAdapter = lhcFillAdapter;
runAdapter.flpRoleAdapter = flpRoleAdapter;

module.exports = {
    attachmentAdapter,
    detectorAdapter,
    dplDetectorAdapter,
    dplProcessExecutionAdapter,
    dplProcessAdapter,
    dplProcessTypeAdapter,
    environmentAdapter,
    environmentHistoryItemAdapter,
    eorReasonAdapter,
    flpRoleAdapter,
    hostAdapter,
    lhcFillAdapter,
    lhcFillStatisticsAdapter,
    logAdapter,
    logRunsAdapter,
    logTagsAdapter,
    reasonTypeAdapter,
    runAdapter,
    runTypeAdapter,
    runDetectorsAdapter,
    subsystemAdapter,
    tagAdapter,
    userAdapter,
};
