/**
 * Returns a textual value by the use of a boolean or a null value.
 *
 * @param {boolean|null} boolean The given boolean
 *
 * @return {string} If present it returs on or off, if not it returns a dash.
 *
 */
export const formatBoolean = (boolean) => {
    if (boolean != null) {
        if (boolean) {
            return 'On';
        }
        return 'Off';
    }
    return '-';
};
