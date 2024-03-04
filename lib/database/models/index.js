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
const Log = require('./log');
const ReasonType = require('./reasontype');
const Run = require('./run');
const RunDetectors = require('./rundetectors.js');
const RunType = require('./runType');
const StableBeamRun = require('./stableBeamsRun.js');
const Subsystem = require('./subsystem');
const Tag = require('./tag');
const User = require('./user');
const LhcPeriod = require('./lhcPeriod');
const LhcPeriodStatistics = require('./lhcPeriodsStatistics');
const DataPass = require('./dataPass.js');
const QCFlagType = require('./qcFlagType.js');
const SimulationPass = require('./simulationPass.js');

module.exports = (sequelize) => {
    const models = {
        Attachment: Attachment(sequelize),
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
        Log: Log(sequelize),
        ReasonType: ReasonType(sequelize),
        Run: Run(sequelize),
        RunDetectors: RunDetectors(sequelize),
        RunType: RunType(sequelize),
        StableBeamRun: StableBeamRun(sequelize),
        Subsystem: Subsystem(sequelize),
        Tag: Tag(sequelize),
        User: User(sequelize),
        LhcPeriod: LhcPeriod(sequelize),
        LhcPeriodStatistics: LhcPeriodStatistics(sequelize),
        DataPass: DataPass(sequelize),
        QCFlagType: QCFlagType(sequelize),
        SimulationPass: SimulationPass(sequelize),
    };

    Object.entries(models).forEach(([_key, model]) => {
        if (model.associate) {
            model.associate(sequelize.models);
        }
    });

    return models;
};
