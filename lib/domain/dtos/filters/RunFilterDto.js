/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */
const Joi = require('joi');
const { CustomJoi } = require('../CustomJoi.js');
const { FromToFilterDto } = require('./FromToFilterDto.js');
const { RUN_QUALITIES } = require('../../enums/RunQualities.js');
const { NumericalComparisonDto } = require('./NumericalComparisonDto.js');
const { RUN_CALIBRATION_STATUS } = require('../../enums/RunCalibrationStatus.js');
const { RUN_DEFINITIONS } = require('../../enums/RunDefinition.js');

const DetectorsFilterDto = Joi.object({
    operator: Joi.string().valid('or', 'and', 'none').required(),
    values: Joi.string().trim(),
});

const EorReasonFilterDto = Joi.object({
    category: Joi.string(),
    title: Joi.string(),
    description: Joi.string(),
});

exports.RunFilterDto = Joi.object({
    runNumbers: Joi.string().trim(),
    calibrationStatuses: Joi.array().items(...RUN_CALIBRATION_STATUS),
    definitions: CustomJoi.stringArray().items(Joi.string().uppercase().trim().valid(...RUN_DEFINITIONS)),
    eorReason: EorReasonFilterDto,
    tags: Joi.object({
        values: CustomJoi.stringArray().items(Joi.string()).single().required(),
        operation: Joi.string().valid('and', 'or', 'none-of').required(),
    }),
    fillNumbers: Joi.string().trim(),
    o2start: FromToFilterDto,
    o2end: FromToFilterDto,
    trgStart: FromToFilterDto,
    trgEnd: FromToFilterDto,
    triggerValues: CustomJoi.stringArray().items(Joi.string().trim().valid('OFF', 'LTU', 'CTP')),
    runDuration: NumericalComparisonDto,
    environmentIds: Joi.string().trim(),
    runQualities: CustomJoi.stringArray().items(Joi.string().trim().valid(...RUN_QUALITIES)),
    nDetectors: NumericalComparisonDto,
    nEpns: NumericalComparisonDto,
    nFlps: NumericalComparisonDto,
    ddflp: Joi.boolean(),
    dcs: Joi.boolean(),
    epn: Joi.boolean(),
    odcTopologyFullName: Joi.string().trim(),
    detectors: DetectorsFilterDto,
    lhcPeriods: Joi.string().trim(),
    dataPassIds: Joi.array().items(Joi.number()),
    simulationPassIds: Joi.array().items(Joi.number()),
    runTypes: CustomJoi.stringArray().items(Joi.string()).single().optional(),
    aliceL3Current: Joi.number().integer(),
    aliceDipoleCurrent: Joi.number().integer(),
    updatedAt: FromToFilterDto,

    muInelasticInteractionRate: NumericalComparisonDto,
    inelasticInteractionRateAvg: NumericalComparisonDto,
    inelasticInteractionRateAtStart: NumericalComparisonDto,
    inelasticInteractionRateAtMid: NumericalComparisonDto,
    inelasticInteractionRateAtEnd: NumericalComparisonDto,
});
