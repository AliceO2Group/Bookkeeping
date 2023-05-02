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
const EnvironmentRepository = require('./EnvironmentRepository');
const EnvironmentHistoryItemRepository = require('./EnvironmentHistoryItemRepository.js');
const EorReasonRepository = require('./EorReasonRepository');
const HostRepository = require('./HostRepository.js');
const LogRepository = require('./LogRepository');
const LogTagsRepository = require('./LogTagsRepository');
const RunRepository = require('./RunRepository');
const RunTypeRepository = require('./RunTypeRepository');
const ReasonTypeRepository = require('./ReasonTypeRepository');
const SubsystemRepository = require('./SubsystemRepository');
const TagRepository = require('./TagRepository');
const UserRepository = require('./UserRepository');
const FlpRoleRepository = require('./FlpRoleRepository');
const LogRunsRepository = require('./LogRunsRepository');
const RunTagsRepository = require('./RunTagsRepository');
const RunDetectorsRepository = require('./RunDetectorsRepository');
const LhcFillRepository = require('./LhcFillRepository');

module.exports = {
    AttachmentRepository,
    DetectorRepository,
    DplDetectorRepository,
    DplProcessExecutionRepository,
    DplProcessRepository,
    DplProcessTypeRepository,
    EnvironmentRepository,
    EnvironmentHistoryItemRepository,
    EorReasonRepository,
    HostRepository,
    LogRepository,
    LogTagsRepository,
    RunRepository,
    ReasonTypeRepository,
    SubsystemRepository,
    TagRepository,
    UserRepository,
    FlpRoleRepository,
    LogRunsRepository,
    RunTagsRepository,
    RunDetectorsRepository,
    RunTypeRepository,
    LhcFillRepository,
};
