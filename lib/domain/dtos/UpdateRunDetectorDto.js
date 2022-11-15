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
const RunDetectorQuality = require('../enums/DetectorQualities');
const EntityIdDto = require('./EntityIdDto');

const BodyDto = Joi.object({
    quality: Joi.string().valid(RunDetectorQuality.Bad, RunDetectorQuality.Good).required(),
});
const QueryDto = Joi.object({
    token: Joi.string(),
});

const UpdateRunDetectorDto = Joi.object({
    query: QueryDto,
    body: BodyDto,
    params: Joi.object({
        runNumber: EntityIdDto.required(),
        detectorId: EntityIdDto.required(),
    }),
});

module.exports = UpdateRunDetectorDto;
