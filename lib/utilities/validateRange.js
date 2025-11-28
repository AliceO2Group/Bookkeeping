/**
 * Validates numbers ranges to not exceed 100 entities
 *
 * @param {*} value  The value to validate
 * @param {*} helpers The helpers object
 * @returns {Object} The value if validation passes
 */
export const validateRange = (value, helpers) => {
    const MAX_RANGE_SIZE = 100;

    const numbers = value.split(',').map((runNumber) => runNumber.trim());

    for (const number of numbers) {
        if (number.includes('-')) {
            const [start, end] = number.split('-').map((n) => parseInt(n, 10));
            if (Number.isNaN(start) || Number.isNaN(end) || start > end) {
                return helpers.error('any.invalid', { message: `Invalid range: ${number}` });
            }
            const rangeSize = end - start + 1;

            if (rangeSize > MAX_RANGE_SIZE) {
                return helpers.error('any.invalid', { message: `Given range exceeds max size of ${MAX_RANGE_SIZE} range: ${number}` });
            }
        }
    }

    return value;
};
