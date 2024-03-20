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

const Joi = require('joi');
const EntityIdDto = require('./EntityIdDto');

const OptionalPositiveIntegerDto = Joi.number()
    .integer()
    .positive()
    .allow(0)
    .optional();

const BodyDto = Joi.object({
    nTimeframes: OptionalPositiveIntegerDto,
    bytesProcessed: OptionalPositiveIntegerDto,
    bytesEquipmentReadOut: OptionalPositiveIntegerDto,
    bytesRecordingReadOut: OptionalPositiveIntegerDto,
    bytesFairMQReadOut: OptionalPositiveIntegerDto,
});

const QueryDto = Joi.object({
    flpName: Joi.string(),
    runNumber: EntityIdDto,
    token: Joi.string(),
});

const ParamsDto = Joi.object({
    flpName: Joi.string(),
    runNumber: EntityIdDto,
});

const CreateLogDto = Joi.object({
    query: QueryDto,
    body: BodyDto,
    params: ParamsDto,
});

module.exports = CreateLogDto;
