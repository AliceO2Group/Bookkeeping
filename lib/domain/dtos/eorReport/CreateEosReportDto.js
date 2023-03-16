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

/**
 * @typedef EosReportCreationRequest
 *
 * @property {number} shiftStart
 * @property {Object|null} typeSpecific
 * @property {string} [traineeName]
 * @property {string} [issues]
 * @property {string} [shiftFlow]
 * @property {string} [infoFromPreviousShifter]
 * @property {string} [infoForNextShifter]
 * @property {string} [infoForRmRc]
 */

const CreateEosReportDto = Joi.object({
    query: {
        token: Joi.string(),
        reportType: Joi.string().valid('ECS').required(),
    },
    body: {
        shiftStart: Joi.number().required(),
        traineeName: Joi.string().optional(),
        issues: Joi.string().optional(),
        shiftFlow: Joi.string().optional(),
        runs: Joi.array().items(Joi.object({})),
        typeSpecific: Joi.alternatives().conditional(Joi.ref('...query.reportType'), {
            switch: [
                {
                    is: 'ECS',
                    then: null,
                },
            ],
        }).required(),
        infoFromPreviousShifter: Joi.string().optional(),
        infoForNextShifter: Joi.string().optional(),
        infoForRmRc: Joi.string().optional(),
    },
    params: Joi.object({}),
});

exports.CreateEosReportDto = CreateEosReportDto;
