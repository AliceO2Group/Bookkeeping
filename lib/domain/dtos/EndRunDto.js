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

const BodyDto = Joi.object({
    timeO2Start: Joi.date().optional(),
    timeTrgStart: Joi.date().optional(),
    timeO2End: Joi.date().optional(),
    timeTrgEnd: Joi.date().optional(),
    triggerValue: Joi.string()
        .valid('OFF', 'LTU', 'CTP').optional(),
    pdpConfigOption: Joi.string().optional(),
    pdpTopologyDescriptionLibraryFile: Joi.string().optional(),
    tfbDdMode: Joi.string().optional().max(64),
    runQuality: Joi.string().valid('good', 'bad', 'test').optional(),
    lhcPeriod: Joi.string().optional(),
    odcTopologyFullName: Joi.string().optional(),
    pdpWorkflowParameters: Joi.string().optional(),
    pdpBeamType: Joi.string().optional(),
    readoutCfgUri: Joi.string().optional(),
});

const QueryDto = Joi.object({
    token: Joi.string(),
});

const ParamsDto = Joi.object({
    runId: Joi.string(),
});

const EndRunDto = Joi.object({
    query: QueryDto,
    body: BodyDto,
    params: ParamsDto,
});

module.exports = EndRunDto;
