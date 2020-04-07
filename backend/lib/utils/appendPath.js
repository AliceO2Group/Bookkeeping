/**
 * function to add one path to another.
 * @param {string} basePath the base path that will be used to append on
 * @param {string} appendix the path that will be added on the base path
 * @param {Object} [options={}] options to be applied on the appending
 * @returns {string} the full appended path
 */
const appendPath = (basePath, appendix, options = {}) => {
    if (options.appendRule !== 'no-slash') {
        appendix = appendix.startsWith('/') ? appendix : '/'.concat(appendix);
    }

    return basePath.concat(appendix);
};

module.exports = appendPath;
