const { origin } = require('./httpConfig.js');

/**
 * Return the given origin with a different port
 *
 * @param {string} origin the origin to change port from
 * @param {number} port the new port to apply
 * @return {string} the new URL
 */
const changeOriginPort = (origin, port) => origin.replace(/(\/\/[a-zA-Z0-9-.]+:)\d+/, (_, match) => `${match}${port}`);

const {
    MONALISA_CERTIFICATE_PATH,
    MONALISA_CERTIFICATE_PASSPHRASE,
    DATA_PASSES_YEAR_LOWER_LIMIT,
    MONALISA_DATA_PASSES_URL,
    MONALISA_DATA_PASS_DETAILS_URL,
    MONALISA_SIMULATION_PASSES_URL,
    MONALISA_ENABLE_SYNCHRONIZATION,
    MONALISA_SYNCHRONIZATION_PERIODS,
} = process.env ?? {};

exports.services = {
    enableHousekeeping: process.env?.ENABLE_HOUSEKEEPING ?? false,
    aliEcsGui: {
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
    qcGui: {
        url: process.env?.QC_GUI_URL || changeOriginPort(origin, 8082),
    },
    aliFlpIndex: {
        url: process.env?.ALI_FLP_INDEX_URL || changeOriginPort(origin, 80),
    },

    monalisa: {
        userCertificate: {
            path: MONALISA_CERTIFICATE_PATH,
            passphrase: MONALISA_CERTIFICATE_PASSPHRASE,
        },
        dataPassesYearLowerLimit: Number(DATA_PASSES_YEAR_LOWER_LIMIT) || 2022,

        dataPassesUrl: MONALISA_DATA_PASSES_URL,
        dataPassDetailsUrl: MONALISA_DATA_PASS_DETAILS_URL,

        simulationPassesUrl: MONALISA_SIMULATION_PASSES_URL,

        enableSynchronization: MONALISA_ENABLE_SYNCHRONIZATION?.toLowerCase() === 'true',
        synchronizationPeriod: Number(MONALISA_SYNCHRONIZATION_PERIODS) || 3600000, //  1h in milisecond
    },
};
