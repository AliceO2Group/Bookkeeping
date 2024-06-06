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
const DataPassAdapter = require('./DataPassAdapter');
const { DataPassQcFlagAdapter } = require('./DataPassQcFlagAdapter.js');
const { DataPassVersionAdapter } = require('./DataPassVersionAdapter.js');
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
const { LhcFillAdapter } = require('./LhcFillAdapter.js');
const { LhcFillStatisticsAdapter } = require('./LhcFillStatisticsAdapter.js');
const LhcPeriodAdapter = require('./LhcPeriodAdapter');
const LhcPeriodStatisticsAdapter = require('./LhcPeriodStatisticsAdapter');
const LogAdapter = require('./LogAdapter');
const LogRunsAdapter = require('./LogRunsAdapter');
const LogTagsAdapter = require('./LogTagsAdapter');
const { QcFlagTypeAdapter } = require('./QcFlagTypeAdapter');
const { QcFlagAdapter } = require('./QcFlagAdapter.js');
const { QcFlagEffectivePeriodAdapter } = require('./QcFlagEffectivePeriodAdapter.js');
const { QcFlagVerificationAdapter } = require('./QcFlagVerificationAdapter.js');
const ReasonTypeAdapter = require('./ReasonTypeAdapter');
const { RunAdapter } = require('./RunAdapter.js');
const RunDetectorsAdapter = require('./RunDetectorsAdapter');
const RunTypeAdapter = require('./RunTypeAdapter');
const SimulationPassAdapter = require('./SimulationPassAdapter.js');
const { SimulationPassQcFlagAdapter } = require('./SimulationPassQcFlagAdapter');
const SubsystemAdapter = require('./SubsystemAdapter');
const TagAdapter = require('./TagAdapter');
const { TriggerCountersAdapter } = require('./TriggerCountersAdapter');
const UserAdapter = require('./UserAdapter');

const attachmentAdapter = new AttachmentAdapter();
const dataPassQcFlagAdapter = new DataPassQcFlagAdapter();
const dataPassAdapter = new DataPassAdapter();
const dataPassVersionAdapter = new DataPassVersionAdapter();
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
const qcFlagEffectivePeriodAdapter = new QcFlagEffectivePeriodAdapter();
const qcFlagVerificationAdapter = new QcFlagVerificationAdapter();
const reasonTypeAdapter = new ReasonTypeAdapter();
const runAdapter = new RunAdapter();
const runDetectorsAdapter = new RunDetectorsAdapter();
const runTypeAdapter = new RunTypeAdapter();
const simulationPassAdapter = new SimulationPassAdapter();
const simulationPassQcFlagAdapter = new SimulationPassQcFlagAdapter();
const subsystemAdapter = new SubsystemAdapter();
const tagAdapter = new TagAdapter();
const triggerCountersAdapter = new TriggerCountersAdapter();
const userAdapter = new UserAdapter();

// Fill dependencies
dataPassAdapter.dataPassVersionAdapter = dataPassVersionAdapter;
dataPassQcFlagAdapter.dataPassAdapter = dataPassAdapter;
dataPassQcFlagAdapter.qcFlagAdapter = qcFlagAdapter;

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

qcFlagAdapter.userAdapter = userAdapter;
qcFlagAdapter.qcFlagTypeAdapter = qcFlagTypeAdapter;
qcFlagAdapter.qcFlagEffectivePeriodAdapter = qcFlagEffectivePeriodAdapter;
qcFlagAdapter.qcFlagVerificationAdapter = qcFlagVerificationAdapter;

qcFlagTypeAdapter.userAdapter = userAdapter;

qcFlagVerificationAdapter.userAdapter = userAdapter;

runAdapter.eorReasonAdapter = eorReasonAdapter;
runAdapter.flpRoleAdapter = flpRoleAdapter;
runAdapter.lhcFillAdapter = lhcFillAdapter;
runAdapter.lhcPeriodAdapter = lhcPeriodAdapter;
runAdapter.logAdapter = logAdapter;
runAdapter.runTypeAdapter = runTypeAdapter;
runAdapter.tagAdapter = tagAdapter;

simulationPassQcFlagAdapter.simulationPassAdapter = simulationPassAdapter;
simulationPassQcFlagAdapter.qcFlagAdapter = qcFlagAdapter;

module.exports = {
    attachmentAdapter,
    dataPassAdapter,
    dataPassQcFlagAdapter,
    dataPassVersionAdapter,
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
    qcFlagEffectivePeriodAdapter,
    qcFlagTypeAdapter,
    qcFlagAdapter,
    qcFlagVerificationAdapter,
    reasonTypeAdapter,
    runAdapter,
    runDetectorsAdapter,
    runTypeAdapter,
    simulationPassAdapter,
    simulationPassQcFlagAdapter,
    subsystemAdapter,
    tagAdapter,
    triggerCountersAdapter,
    userAdapter,
};
