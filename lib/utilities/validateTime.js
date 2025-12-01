/**
 * Validates digital time in string format
 *
 * @param {*} value  The time to validate
 * @param {*} helpers The helpers object
 * @param {boolean} transformSeconds Return value as seconds
 * @returns {number|string|import("joi").ValidationError} The value if validation passes
 */
export const validateTime = (value, helpers, transformSeconds = false) => {
    const timeSectionsString = value.split(':');
    let timeSeconds = 0;
    let powerValue = 2;

    for (const timeSectionString of timeSectionsString) {
        if (!Number.isNaN(timeSectionString)) {
            const timeSection = Number(timeSectionString);
            if (timeSection <= 60 && timeSection >= 0) {
                if (powerValue !== 0) {
                    timeSeconds += timeSection * 60 ** powerValue;
                } else {
                    timeSeconds += timeSection;
                }
            } else {
                return helpers.error('any.invalid', { message: `Invalid time period: ${timeSection}` });
            }
        } else {
            return helpers.error('any.invalid', { message: `Invalid time: ${timeSectionString}` });
        }
        powerValue--;
    }

    return transformSeconds ? timeSeconds : value;
};
