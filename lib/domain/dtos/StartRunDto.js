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

const detectorsDto = Joi.extend((joi) => ({
    base: joi.string(),
    type: 'detectorList',
    validate: (value, helpers) => {
        const validList = ['CPV', 'EMC', 'FDD', 'FT0', 'FV0', 'HMP', 'ITS', 'MCH', 'MFT', 'MID', 'PHS', 'TOF', 'TPC', 'TRD', 'TST', 'ZDC'];
        const detectorList = value.replace(/^,+|,+$/mg, '').split(',');
        const isValid = detectorList.every((detector) => validList.includes(detector));
        return isValid ? { value } : { errors: helpers.error('Provide detector list contains invalid elements') };
    },
}));

const BodyDto = Joi.object({
    timeO2Start: Joi.date().optional(),
    timeTrgStart: Joi.date().optional(),
    environmentId: Joi.string(),
    runType: Joi.string(),
    runQuality: Joi.string()
        .valid('good', 'bad', 'test').default('test'),
    nDetectors: Joi.number(),
    nFlps: Joi.number(),
    nEpns: Joi.number(),
    nSubtimeframes: Joi.number(),
    bytesReadOut: Joi.number(),
    runNumber: Joi.number(),
    triggerValue: Joi.string()
        .valid('OFF', 'LTU', 'CTP').default('OFF'),
    dd_flp: Joi.boolean().default(false),
    dcs: Joi.boolean().default(false),
    epn: Joi.boolean().default(false),
    epnTopology: Joi.string(),
    detectors: detectorsDto.detectorList(),
});

const QueryDto = Joi.object({
    token: Joi.string(),
});

const StartRunDto = Joi.object({
    query: QueryDto,
    body: BodyDto,
    params: Joi.object({}),
});

module.exports = StartRunDto;
