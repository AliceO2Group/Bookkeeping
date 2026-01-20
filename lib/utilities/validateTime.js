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

const joiTimeDurationErrorText = 'Invalid duration value';

/**
 * Transform digital time in string format
 *
 * @param {*} incomingValue  The time to transform
 * @returns {number} The value as seconds (Number)
 */
export const transformTime = (incomingValue) => {
    // Extract time to seconds...
    const [hoursStr, minutesStr, secondsStr] = incomingValue.split(':');

    return Number(hoursStr) * 3600 + Number(minutesStr) * 60 + Number(secondsStr);
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
        'any.invalid': joiTimeDurationErrorText,
    }),
    operator: Joi.string().trim().min(1).max(2),
});
