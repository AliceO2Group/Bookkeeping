import Joi from 'joi';

/**
 * Validates digital time in string format
 *
 * @param {*} incomingValue  The time to validate
 * @param {*} helpers The helpers object
 * @returns {number|import("joi").ValidationError} The value if validation passes, as seconds (Number)
 */
export const validateTime = (incomingValue, helpers) => {
    // Checks for valid time format.
    const { error, value } = Joi.string().pattern(/^\d{2}:[0-5]\d:[0-5]\d$/).validate(incomingValue);

    if (error !== undefined) {
        return helpers.error('any.invalid', { message: `Validation error: ${error?.message ?? 'failed to validate time'}` });
    }

    // Extract time to seconds...
    const [hoursStr, minutesStr, secondsStr] = value.split(':');

    const hours = Number(hoursStr);
    const minutes = Number(minutesStr);
    const seconds = Number(secondsStr);

    return hours * 3600 + minutes * 60 + seconds;
};
