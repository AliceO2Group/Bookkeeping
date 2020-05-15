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
const CreateLogAttachmentDto = require('./CreateLogAttachmentDto');
const CreateLogDto = require('./CreateLogDto');
const CreateSubsystemDto = require('./CreateSubsystemDto');
const CreateTagDto = require('./CreateTagDto');
const EntityIdDto = require('./EntityIdDto');
const GetAllLogsDto = require('./GetAllLogsDto');
const GetAllSubsystemsDto = require('./GetAllSubsystemsDto');
const GetAllTagsDto = require('./GetAllTagsDto');
const GetLogDto = require('./GetLogDto');
const GetSubsystemDto = require('./GetSubsystemDto');
const GetTagDto = require('./GetTagDto');
const PaginationDto = require('./PaginationDto');

module.exports = {
    CreateAttachmentDto,
    CreateLogAttachmentDto,
    CreateLogDto,
    CreateSubsystemDto,
    CreateTagDto,
    EntityIdDto,
    GetAllLogsDto,
    GetAllSubsystemsDto,
    GetAllTagsDto,
    GetLogDto,
    GetSubsystemDto,
    GetTagDto,
    PaginationDto,
};
