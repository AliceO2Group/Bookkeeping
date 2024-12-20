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
const CreateLhcFillDto = require('./CreateLhcFillDto');
const CreateLogDto = require('./CreateLogDto');
const CreateTagDto = require('./CreateTagDto');
const EntityIdDto = require('./EntityIdDto');
const GetAllEnvironmentsDto = require('./GetAllEnvironmentsDto');
const GetAllLhcFillsDto = require('./GetAllLhcFillsDto');
const GetAllLogAttachmentsDto = require('./GetAllLogAttachmentsDto');
const GetAllLogsDto = require('./GetAllLogsDto');
const GetAllRunsDto = require('./GetAllRunsDto');
const GetAllRunTypesDto = require('./GetAllRunTypesDto');
const GetAllTagsDto = require('./GetAllTagsDto');
const GetAllFlpsDto = require('./GetAllFlpsDto');
const GetAttachmentDto = require('./GetAttachmentDto');
const GetEnvironmentDto = require('./GetEnvironmentDto');
const GetLhcFillDto = require('./GetLhcFillDto');
const GetLhcFillRunDto = require('./GetLhcFillRunDto');
const GetLogDto = require('./GetLogDto');
const GetLogAttachmentDto = require('./GetLogAttachmentDto');
const GetRunDto = require('./GetRunDto');
const GetRunTypeDto = require('./GetRunTypeDto');
const StartRunDto = require('./StartRunDto');
const EndRunDto = require('./EndRunDto');
const GetTagDto = require('./GetTagDto');
const GetFlpDto = require('./GetFlpDto');
const PaginationDto = require('./PaginationDto');
const UpdateEnvironmentDto = require('./UpdateEnvironmentDto');
const UpdateFlpDto = require('./UpdateFlpDto');
const UpdateLhcFillDto = require('./UpdateLhcFillDto');
const UpdateRunByRunNumberDto = require('./UpdateRunByRunNumberDto');
const UpdateRunDto = require('./UpdateRunDto');
const UpdateTagDto = require('./UpdateTagDto');
const GetTagByNameDto = require('./GetTagByNameDto.js');

module.exports = {
    CreateAttachmentDto,
    CreateEnvironmentDto,
    CreateFlpDto,
    CreateLhcFillDto,
    CreateLogDto,
    CreateTagDto,
    EndRunDto,
    EntityIdDto,
    GetAllEnvironmentsDto,
    GetAllLhcFillsDto,
    GetAllLogAttachmentsDto,
    GetAllLogsDto,
    GetAllRunsDto,
    GetAllRunTypesDto,
    GetAllTagsDto,
    GetAllFlpsDto,
    GetAttachmentDto,
    GetEnvironmentDto,
    GetLhcFillDto,
    GetLhcFillRunDto,
    GetLogDto,
    GetLogAttachmentDto,
    GetRunDto,
    GetRunTypeDto,
    StartRunDto,
    GetTagByNameDto,
    GetTagDto,
    GetFlpDto,
    PaginationDto,
    UpdateEnvironmentDto,
    UpdateFlpDto,
    UpdateLhcFillDto,
    UpdateRunByRunNumberDto,
    UpdateRunDto,
    UpdateTagDto,
};
