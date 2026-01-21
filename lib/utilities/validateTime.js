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
import Joi from 'joi';
import { NUMERICAL_COMPARISON_OPERATORS } from '../domain/dtos/filters/NumericalComparisonDto.js';

const joiTimeDurationErrorText = 'Invalid duration value';

/**
 * Transform digital time in string format
 *
 * @param {string} incomingValue  The time to transform
 * @param {*} helpers The Joi helpers object
 * @returns {number|import("joi").ValidationError} The value if transformation passes, as seconds (Number)
 */
export const transformTime = (incomingValue, helpers) => {
    try {
        // Extract time to seconds...
        const [hoursStr, minutesStr, secondsStr] = incomingValue.split(':');

        const hours = Number(hoursStr);
        const minutes = Number(minutesStr);
        const seconds = Number(secondsStr);

        return hours * 3600 + minutes * 60 + seconds;
    } catch (error) {
        return helpers.error('any.invalid', { message: `Validation error: ${error?.message ?? 'failed to transform time'}` });
    }
};

/**
 * Joi object that validates time duration filters.
 * This is for duration, not a point in time. 10000:59:59 is valid.
 * The operator is also validated.
 */
export const validateTimeDuration = Joi.object({
    limit: Joi.string().trim().pattern(/^\d+:[0-5]?\d:[0-5]?\d$/).custom(transformTime).messages({
        'string.pattern.base': joiTimeDurationErrorText,
        'string.base': joiTimeDurationErrorText,
    }),
    operator: Joi.string().valid(...NUMERICAL_COMPARISON_OPERATORS),
});
