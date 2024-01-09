const fs = require('fs');
const { origin } = require('./httpConfig.js');

/**
 * Return the given origin with a different port
 *
 * @param {string} origin the origin to change port from
 * @param {number} port the new port to apply
 * @return {string} the new URL
 */
const changeOriginPort = (origin, port) => origin.replace(/(\/\/[a-zA-Z0-9-.]+:)\d+/, (_, match) => `${match}${port}`);

const { ALI_FLP_INDEX_URL } = process.env ?? {};

const {
    MONALISA_CERTIFICATE_PATH,
    MONALISA_CERTIFICATE_PASSPHRASE,
    DATA_PASSES_YEAR_LOWER_LIMIT,
    MONALISA_DATA_PASSES_URL,
} = process.env ?? {};

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
    aliFlp: {
        index: ALI_FLP_INDEX_URL || changeOriginPort(origin, 8082),
    },

    monalisa: {
        userCertificate: {
            pfx: MONALISA_CERTIFICATE_PATH ? fs.readFileSync(MONALISA_CERTIFICATE_PATH) : undefined,
            passphrase: MONALISA_CERTIFICATE_PASSPHRASE || undefined,
        },
        dataPassesYearLowerLimit: Number(DATA_PASSES_YEAR_LOWER_LIMIT) || 2022,

        dataPassesUrl: MONALISA_DATA_PASSES_URL,
    },
};
