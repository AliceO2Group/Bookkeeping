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
const { QcFlagTypeAdapter } = require('./QcFlagTypeAdapter');
const { QcFlagAdapter } = require('./QcFlagAdapter.js');
const ReasonTypeAdapter = require('./ReasonTypeAdapter');
const RunTypeAdapter = require('./RunTypeAdapter');
const SubsystemAdapter = require('./SubsystemAdapter');
const TagAdapter = require('./TagAdapter');
const UserAdapter = require('./UserAdapter');
const { LhcFillAdapter } = require('./LhcFillAdapter.js');
const { LhcFillStatisticsAdapter } = require('./LhcFillStatisticsAdapter.js');
const { RunAdapter } = require('./RunAdapter.js');
const RunDetectorsAdapter = require('./RunDetectorsAdapter');
const LhcPeriodAdapter = require('./LhcPeriodAdapter');
const LhcPeriodStatisticsAdapter = require('./LhcPeriodStatisticsAdapter');
const DataPassAdapter = require('./DataPassAdapter');
const SimulationPassAdapter = require('./SimulationPassAdapter.js');

const attachmentAdapter = new AttachmentAdapter();
const dataPassAdapter = new DataPassAdapter();
const detectorAdapter = new DetectorAdapter();
const dplDetectorAdapter = new DplDetectorAdapter();
const dplProcessAdapter = new DplProcessAdapter();
const dplProcessExecutionAdapter = new DplProcessExecutionAdapter();
const dplProcessTypeAdapter = new DplProcessTypeAdapter();
const environmentAdapter = new EnvironmentAdapter();
const environmentHistoryItemAdapter = new EnvironmentHistoryItemAdapter();
const eorReasonAdapter = new EorReasonAdapter();
const flpRoleAdapter = new FlpRoleAdapter();
const hostAdapter = new HostAdapter();
const lhcFillAdapter = new LhcFillAdapter();
const lhcFillStatisticsAdapter = new LhcFillStatisticsAdapter();
const lhcPeriodAdapter = new LhcPeriodAdapter();
const lhcPeriodStatisticsAdapter = new LhcPeriodStatisticsAdapter();
const logAdapter = new LogAdapter();
const logRunsAdapter = new LogRunsAdapter();
const logTagsAdapter = new LogTagsAdapter();
const qcFlagTypeAdapter = new QcFlagTypeAdapter();
const qcFlagAdapter = new QcFlagAdapter();
const reasonTypeAdapter = new ReasonTypeAdapter();
const runAdapter = new RunAdapter();
const runDetectorsAdapter = new RunDetectorsAdapter();
const runTypeAdapter = new RunTypeAdapter();
const simulationPassAdapter = new SimulationPassAdapter();
const subsystemAdapter = new SubsystemAdapter();
const tagAdapter = new TagAdapter();
const userAdapter = new UserAdapter();

// Fill dependencies
dplDetectorAdapter.dplProcessExecutionAdapter = dplProcessExecutionAdapter;

dplProcessAdapter.dplProcessExecutionAdapter = dplProcessExecutionAdapter;
dplProcessAdapter.dplProcessTypeAdapter = dplProcessTypeAdapter;

dplProcessExecutionAdapter.dplDetectorAdapter = dplDetectorAdapter;
dplProcessExecutionAdapter.dplProcessAdapter = dplProcessAdapter;
dplProcessExecutionAdapter.hostAdapter = hostAdapter;
dplProcessExecutionAdapter.runAdapter = runAdapter;

environmentAdapter.environmentHistoryItemAdapter = environmentHistoryItemAdapter;
environmentAdapter.runAdapter = runAdapter;

eorReasonAdapter.reasonTypeAdapter = reasonTypeAdapter;

flpRoleAdapter.runAdapter = runAdapter;

hostAdapter.dplProcessExecutionAdapter = dplProcessExecutionAdapter;

lhcFillAdapter.runAdapter = runAdapter;
lhcFillAdapter.statisticsAdapter = lhcFillStatisticsAdapter;

lhcPeriodStatisticsAdapter.lhcPeriodAdapter = lhcPeriodAdapter;

logAdapter.attachmentAdapter = attachmentAdapter;
logAdapter.environmentAdapter = environmentAdapter;
logAdapter.lhcFillAdapter = lhcFillAdapter;
logAdapter.runAdapter = runAdapter;
logAdapter.subsystemAdapter = subsystemAdapter;
logAdapter.tagAdapter = tagAdapter;
logAdapter.userAdapter = userAdapter;

qcFlagTypeAdapter.userAdapter = userAdapter;
qcFlagAdapter.userAdapter = userAdapter;
qcFlagAdapter.qcFlagTypeAdapter = qcFlagTypeAdapter;

runAdapter.eorReasonAdapter = eorReasonAdapter;
runAdapter.flpRoleAdapter = flpRoleAdapter;
runAdapter.lhcFillAdapter = lhcFillAdapter;
runAdapter.lhcPeriodAdapter = lhcPeriodAdapter;
runAdapter.logAdapter = logAdapter;
runAdapter.runTypeAdapter = runTypeAdapter;
runAdapter.tagAdapter = tagAdapter;

module.exports = {
    attachmentAdapter,
    dataPassAdapter,
    detectorAdapter,
    dplDetectorAdapter,
    dplProcessAdapter,
    dplProcessExecutionAdapter,
    dplProcessTypeAdapter,
    environmentAdapter,
    environmentHistoryItemAdapter,
    eorReasonAdapter,
    flpRoleAdapter,
    hostAdapter,
    lhcFillAdapter,
    lhcFillStatisticsAdapter,
    lhcPeriodAdapter,
    lhcPeriodStatisticsAdapter,
    logAdapter,
    logRunsAdapter,
    logTagsAdapter,
    qcFlagTypeAdapter,
    qcFlagAdapter,
    reasonTypeAdapter,
    runAdapter,
    runDetectorsAdapter,
    runTypeAdapter,
    simulationPassAdapter,
    subsystemAdapter,
    tagAdapter,
    userAdapter,
};
