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
const EntityIdDto = require('../EntityIdDto.js');

exports.FlpSchema = Joi.object({
    id: EntityIdDto.optional(),
    name: Joi.string().min(1).required(),
    hostname: Joi.string().min(1).required(),
    runNumber: EntityIdDto.required(),
    nTimeframes: Joi.number().optional(),
    bytesProcessed: Joi.number().optional(),
    bytesEquipmentReadOut: Joi.number().optional(),
    bytesRecordingReadOut: Joi.number().optional(),
    bytesFairMQReadOut: Joi.number().optional(),
    subtype: Joi.string().optional(),
});
