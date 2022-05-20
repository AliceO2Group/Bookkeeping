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

const CreateAttachmentDto = require('./CreateAttachmentDto');
const CreateEnvironmentDto = require('./CreateEnvironmentDto.js');
const CreateFlpDto = require('./CreateFlpDto');
const CreateLogDto = require('./CreateLogDto');
const CreateSubsystemDto = require('./CreateSubsystemDto');
const CreateTagDto = require('./CreateTagDto');
const EntityIdDto = require('./EntityIdDto');
const GetAllEnvironmentsDto = require('./GetAllEnvironmentsDto');
const GetAllLogAttachmentsDto = require('./GetAllLogAttachmentsDto');
const GetAllLogsDto = require('./GetAllLogsDto');
const GetAllRunsDto = require('./GetAllRunsDto');
const GetAllSubsystemsDto = require('./GetAllSubsystemsDto');
const GetAllTagsDto = require('./GetAllTagsDto');
const GetAllFlpsDto = require('./GetAllFlpsDto');
const GetAttachmentDto = require('./GetAttachmentDto');
const GetEnvironmentDto = require('./GetEnvironmentDto');
const GetLhcFillDto = require('./GetLhcFillDto');
const GetLogDto = require('./GetLogDto');
const GetLogAttachmentDto = require('./GetLogAttachmentDto');
const GetRunDto = require('./GetRunDto');
const StartRunDto = require('./StartRunDto');
const EndRunDto = require('./EndRunDto');
const GetSubsystemDto = require('./GetSubsystemDto');
const GetTagDto = require('./GetTagDto');
const GetFlpDto = require('./GetFlpDto');
const PaginationDto = require('./PaginationDto');
const UpdateEnvironmentDto = require('./UpdateEnvironmentDto');
const UpdateFlpDto = require('./UpdateFlpDto');
const UpdateRunByRunNumberDto = require('./UpdateRunByRunNumberDto');
const UpdateRunTagsDto = require('./UpdateRunTagsDto');
const UpdateRunDto = require('./UpdateRunDto');
const UpdateTagDto = require('./UpdateTagDto');
const GetTagByNameDto = require('./GetTagByNameDto.js');

module.exports = {
    CreateAttachmentDto,
    CreateEnvironmentDto,
    CreateFlpDto,
    CreateLogDto,
    CreateSubsystemDto,
    CreateTagDto,
    EndRunDto,
    EntityIdDto,
    GetAllEnvironmentsDto,
    GetAllLogAttachmentsDto,
    GetAllLogsDto,
    GetAllRunsDto,
    GetAllSubsystemsDto,
    GetAllTagsDto,
    GetAllFlpsDto,
    GetAttachmentDto,
    GetEnvironmentDto,
    GetLhcFillDto,
    GetLogDto,
    GetLogAttachmentDto,
    GetRunDto,
    StartRunDto,
    GetSubsystemDto,
    GetTagByNameDto,
    GetTagDto,
    GetFlpDto,
    PaginationDto,
    UpdateEnvironmentDto,
    UpdateFlpDto,
    UpdateRunByRunNumberDto,
    UpdateRunTagsDto,
    UpdateRunDto,
    UpdateTagDto,
};
