const { origin } = require('./httpConfig.js');

/**
 * Return the given origin with a different port
 *
 * @param {string} origin the origin to change port from
 * @param {number} port the new port to apply
 * @return {string} the new URL
 */
const changeOriginPort = (origin, port) => origin.replace(/(\/\/[a-zA-Z0-9-.]+:)\d+/, (_, match) => `${match}${port}`);

exports.services = {
    enableHousekeeping: process.env?.ENABLE_HOUSEKEEPING ?? false,
    aliEcsGUI: {
        url: process.env?.ALI_ECS_GUI_URL || changeOriginPort(origin, 8080),
        token: process.env?.ALI_ECS_GUI_TOKEN,
    },
    infologger: {
        flp: {
            url: process.env?.FLP_INFOLOGGER_URL || changeOriginPort(origin, 8081),
        },
        epn: {
            url: process.env?.EPN_INFOLOGGER_URL || null,
        },
    },
};
