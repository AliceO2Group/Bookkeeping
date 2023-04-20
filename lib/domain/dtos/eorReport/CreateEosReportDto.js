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
const { SHIFT_TYPES, ShiftTypes } = require('../../enums/ShiftTypes.js');

/**
 * @typedef EosReportCreationRequest
 *
 * @property {number} shiftStart
 * @property {object|null} typeSpecific
 * @property {string} shifterName
 * @property {string} [traineeName]
 * @property {string} [lhcTransitions]
 * @property {string} [shiftFlow]
 * @property {string} [infoFromPreviousShifter]
 * @property {string} [infoForNextShifter]
 * @property {string} [infoForRmRc]
 */

const CreateEosReportDto = Joi.object({
    query: {
        token: Joi.string(),
        reportType: Joi.string().valid(...SHIFT_TYPES).required(),
    },
    body: {
        shifterName: Joi.string(),
        traineeName: Joi.string().optional(),
        lhcTransitions: Joi.string().optional(),
        shiftFlow: Joi.string().optional(),
        runs: Joi.array().items(Joi.object({})),
        typeSpecific: Joi.alternatives().conditional(Joi.ref('...query.reportType'), {
            switch: [
                {
                    is: ShiftTypes.ECS,
                    then: Joi.object({
                        environmentComments: Joi.object().pattern(Joi.string().min(1), Joi.string()),
                        runComments: Joi.object().pattern(/\d/, Joi.string()),
                    }),
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
