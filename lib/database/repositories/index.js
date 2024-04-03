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
const LogEnvironmentsRepository = require('./LogEnvironmentsRepository');
const LogLhcFillsRepository = require('./LogLhcFillsRepository');
const LogRepository = require('./LogRepository');
const LogRunsRepository = require('./LogRunsRepository');
const LogTagsRepository = require('./LogTagsRepository');
const ReasonTypeRepository = require('./ReasonTypeRepository');
const RunDetectorsRepository = require('./RunDetectorsRepository');
const RunRepository = require('./RunRepository');
const RunTagsRepository = require('./RunTagsRepository');
const RunTypeRepository = require('./RunTypeRepository');
const StableBeamRunsRepository = require('./StableBeamRunsRepository.js');
const SubsystemRepository = require('./SubsystemRepository');
const TagRepository = require('./TagRepository');
const UserRepository = require('./UserRepository');
const LhcPeriodRepository = require('./LhcPeriodRepository');
const LhcPeriodStatisticsRepository = require('./LhcPeriodStatisticsRepository');
const DataPassRepository = require('./DataPassRepository.js');
const SimulationPassRepository = require('./SimulationPassRepository.js');
const QcFlagTypeRepository = require('./QcFlagTypeRepository.js');

module.exports = {
    AttachmentRepository,
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
    LogEnvironmentsRepository,
    LogLhcFillsRepository,
    LogRepository,
    LogRunsRepository,
    LogTagsRepository,
    ReasonTypeRepository,
    RunDetectorsRepository,
    RunRepository,
    RunTagsRepository,
    RunTypeRepository,
    StableBeamRunsRepository,
    SubsystemRepository,
    TagRepository,
    UserRepository,
    LhcPeriodRepository,
    LhcPeriodStatisticsRepository,
    DataPassRepository,
    SimulationPassRepository,
    QcFlagTypeRepository,
};
