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

const MagnetConfigurationSchema = Joi.object({ solenoid: Joi.string(), dipole: Joi.string() });

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
                {
                    is: ShiftTypes.QC_PDP,
                    then: Joi.object({
                        runComments: Joi.object().pattern(/\d/, Joi.string()),
                    }),
                },
                {
                    is: ShiftTypes.SLIMOS,
                    then: null,
                },
                {
                    is: ShiftTypes.SL,
                    then: Joi.object({
                        magnets: Joi.object({
                            start: MagnetConfigurationSchema,
                            intermediates: Joi.array().items(Joi.object({
                                timestamp: Joi.string().pattern(/\d{2}:\d{2}:\d{2}/),
                                magnetConfiguration: MagnetConfigurationSchema,
                            })),
                            end: MagnetConfigurationSchema,
                        }),
                    }),
                },
            ],
        }).required(),
        infoFromPreviousShifter: Joi.string().allow('').optional(),
        infoForNextShifter: Joi.string().allow('').optional(),
        infoForRmRc: Joi.string().allow('').optional(),
    },
    params: Joi.object({}),
});

exports.CreateEosReportDto = CreateEosReportDto;
