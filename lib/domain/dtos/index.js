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
const CreateFlpDto = require('./CreateFlpDto');
const CreateLogDto = require('./CreateLogDto');
const CreateSubsystemDto = require('./CreateSubsystemDto');
const CreateTagDto = require('./CreateTagDto');
const EntityIdDto = require('./EntityIdDto');
const GetAllLogAttachmentsDto = require('./GetAllLogAttachmentsDto');
const GetAllLogsDto = require('./GetAllLogsDto');
const GetAllRunsDto = require('./GetAllRunsDto');
const GetAllSubsystemsDto = require('./GetAllSubsystemsDto');
const GetAllTagsDto = require('./GetAllTagsDto');
const GetAllFlpsDto = require('./GetAllFlpsDto');
const GetAttachmentDto = require('./GetAttachmentDto');
const GetLogDto = require('./GetLogDto');
const GetLogAttachmentDto = require('./GetLogAttachmentDto');
const GetRunDto = require('./GetRunDto');
const StartRunDto = require('./StartRunDto');
const EndRunDto = require('./EndRunDto');
const GetSubsystemDto = require('./GetSubsystemDto');
const GetTagDto = require('./GetTagDto');
const GetFlpDto = require('./GetFlpDto');
const PaginationDto = require('./PaginationDto');
const UpdateFlpDto = require('./UpdateFlpDto');
const UpdateRunTagsDto = require('./UpdateRunTagsDto');
const UpdateRunDto = require('./UpdateRunDto');
const GetTagByNameDto = require('./GetTagByNameDto.js');

module.exports = {
    CreateAttachmentDto,
    CreateFlpDto,
    CreateLogDto,
    CreateSubsystemDto,
    CreateTagDto,
    EntityIdDto,
    GetAllLogAttachmentsDto,
    GetAllLogsDto,
    GetAllRunsDto,
    GetAllSubsystemsDto,
    GetAllTagsDto,
    GetAllFlpsDto,
    GetAttachmentDto,
    GetLogDto,
    GetLogAttachmentDto,
    GetRunDto,
    StartRunDto,
    EndRunDto,
    GetSubsystemDto,
    GetTagDto,
    GetFlpDto,
    PaginationDto,
    UpdateRunTagsDto,
    UpdateRunDto,
    UpdateFlpDto,
    GetTagByNameDto,
};
