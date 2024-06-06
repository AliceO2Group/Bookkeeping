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

const AttachmentRepository = require('./AttachmentRepository');
const DataPassRepository = require('./DataPassRepository.js');
const DataPassQcFlagRepository = require('./DataPassQcFlagRepository.js');
const DataPassVersionRepository = require('./DataPassVersionRepository.js');
const DetectorRepository = require('./DetectorRepository');
const DplDetectorRepository = require('./dpl/DplDetectorRepository.js');
const DplProcessExecutionRepository = require('./dpl/DplProcessExecutionRepository.js');
const DplProcessRepository = require('./dpl/DplProcessRepository.js');
const DplProcessTypeRepository = require('./dpl/DplProcessTypeRepository.js');
const EnvironmentHistoryItemRepository = require('./EnvironmentHistoryItemRepository.js');
const EnvironmentRepository = require('./EnvironmentRepository');
const EorReasonRepository = require('./EorReasonRepository');
const FlpRoleRepository = require('./FlpRoleRepository');
const HostRepository = require('./HostRepository.js');
const LhcFillRepository = require('./LhcFillRepository');
const LhcFillStatisticsRepository = require('./LhcFillStatisticsRepository.js');
const LhcPeriodRepository = require('./LhcPeriodRepository');
const LhcPeriodStatisticsRepository = require('./LhcPeriodStatisticsRepository');
const LogEnvironmentsRepository = require('./LogEnvironmentsRepository');
const LogLhcFillsRepository = require('./LogLhcFillsRepository');
const LogRepository = require('./LogRepository');
const LogRunsRepository = require('./LogRunsRepository');
const LogTagsRepository = require('./LogTagsRepository');
const QcFlagRepository = require('./QcFlagRepository.js');
const QcFlagEffectivePeriodRepository = require('./QcFlagEffectivePeriodRepository.js');
const QcFlagTypeRepository = require('./QcFlagTypeRepository.js');
const QcFlagVerificationRepository = require('./QcFlagVerificationRepository.js');
const ReasonTypeRepository = require('./ReasonTypeRepository');
const RunDetectorsRepository = require('./RunDetectorsRepository');
const RunRepository = require('./RunRepository');
const RunTagsRepository = require('./RunTagsRepository');
const RunTypeRepository = require('./RunTypeRepository');
const SimulationPassRepository = require('./SimulationPassRepository.js');
const SimulationPassQcFlagRepository = require('./SimulationPassQcFlagRepository.js');
const StableBeamRunsRepository = require('./StableBeamRunsRepository.js');
const SubsystemRepository = require('./SubsystemRepository');
const TagRepository = require('./TagRepository');
const TriggerCountersRepository = require('./TriggerCountersRepository');
const UserRepository = require('./UserRepository');

module.exports = {
    AttachmentRepository,
    DataPassRepository,
    DataPassQcFlagRepository,
    DataPassVersionRepository,
    DetectorRepository,
    DplDetectorRepository,
    DplProcessExecutionRepository,
    DplProcessRepository,
    DplProcessTypeRepository,
    EnvironmentHistoryItemRepository,
    EnvironmentRepository,
    EorReasonRepository,
    FlpRoleRepository,
    HostRepository,
    LhcFillRepository,
    LhcFillStatisticsRepository,
    LhcPeriodRepository,
    LhcPeriodStatisticsRepository,
    LogEnvironmentsRepository,
    LogLhcFillsRepository,
    LogRepository,
    LogRunsRepository,
    LogTagsRepository,
    QcFlagRepository,
    QcFlagEffectivePeriodRepository,
    QcFlagTypeRepository,
    QcFlagVerificationRepository,
    ReasonTypeRepository,
    RunDetectorsRepository,
    RunRepository,
    RunTagsRepository,
    RunTypeRepository,
    SimulationPassRepository,
    SimulationPassQcFlagRepository,
    StableBeamRunsRepository,
    SubsystemRepository,
    TagRepository,
    TriggerCountersRepository,
    UserRepository,
};
