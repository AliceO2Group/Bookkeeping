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

const Attachment = require('./attachment');
const DataPass = require('./dataPass.js');
const DataPassQcFlag = require('./dataPassQcFlag.js');
const DataPassVersion = require('./dataPassVersion.js');
const Detector = require('./detector');
const DplDetector = require('./dpl/dpldetector.js');
const DplProcess = require('./dpl/dplprocess.js');
const DplProcessExecution = require('./dpl/dplprocessexecution.js');
const DplProcessType = require('./dpl/dplprocesstype.js');
const Environment = require('./environment');
const EnvironmentHistoryItem = require('./environmenthistoryitem');
const EorReason = require('./eorreason');
const EpnRoleSession = require('./epnrolesession');
const FlpRole = require('./flprole');
const Host = require('./host.js');
const LhcFill = require('./lhcFill');
const LhcFillStatistics = require('./lhcFillStatistics.js');
const LhcPeriod = require('./lhcPeriod');
const LhcPeriodStatistics = require('./lhcPeriodsStatistics');
const Log = require('./log');
const QcFlag = require('./qcFlag.js');
const QcFlagEffectivePeriod = require('./qcFlagEffectivePeriod.js');
const QcFlagType = require('./qcFlagType.js');
const QcFlagVerification = require('./qcFlagVerification.js');
const ReasonType = require('./reasontype');
const Run = require('./run');
const RunDetectors = require('./rundetectors.js');
const RunType = require('./runType');
const SimulationPass = require('./simulationPass.js');
const SimulationPassQcFlag = require('./simulationPassQcFlag.js');
const StableBeamRun = require('./stableBeamsRun.js');
const Subsystem = require('./subsystem');
const Tag = require('./tag');
const TriggerCounters = require('./triggerCounters');
const User = require('./user');

module.exports = (sequelize) => {
    const models = {
        Attachment: Attachment(sequelize),
        DataPass: DataPass(sequelize),
        DataPassQcFlag: DataPassQcFlag(sequelize),
        DataPassVersion: DataPassVersion(sequelize),
        Detector: Detector(sequelize),
        DplDetector: DplDetector(sequelize),
        DplProcess: DplProcess(sequelize),
        DplProcessExecution: DplProcessExecution(sequelize),
        DplProcessType: DplProcessType(sequelize),
        Environment: Environment(sequelize),
        EnvironmentHistoryItem: EnvironmentHistoryItem(sequelize),
        EorReason: EorReason(sequelize),
        EpnRoleSessionkey: EpnRoleSession(sequelize),
        FlpRole: FlpRole(sequelize),
        Host: Host(sequelize),
        LhcFill: LhcFill(sequelize),
        LhcFillStatistics: LhcFillStatistics(sequelize),
        LhcPeriod: LhcPeriod(sequelize),
        LhcPeriodStatistics: LhcPeriodStatistics(sequelize),
        Log: Log(sequelize),
        QcFlag: QcFlag(sequelize),
        QcFlagEffectivePeriod: QcFlagEffectivePeriod(sequelize),
        QcFlagType: QcFlagType(sequelize),
        QcFlagVerification: QcFlagVerification(sequelize),
        ReasonType: ReasonType(sequelize),
        Run: Run(sequelize),
        RunDetectors: RunDetectors(sequelize),
        RunType: RunType(sequelize),
        SimulationPass: SimulationPass(sequelize),
        SimulationPassQcFlag: SimulationPassQcFlag(sequelize),
        StableBeamRun: StableBeamRun(sequelize),
        Subsystem: Subsystem(sequelize),
        Tag: Tag(sequelize),
        TriggerCounters: TriggerCounters(sequelize),
        User: User(sequelize),
    };

    Object.entries(models).forEach(([_key, model]) => {
        if (model.associate) {
            model.associate(sequelize.models);
        }
    });

    return models;
};
