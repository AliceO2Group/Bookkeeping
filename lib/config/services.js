const { origin } = require('./httpConfig.js');

/**
 * Return the given origin with a different port
 *
 * @param {string} origin the origin to change port from
 * @param {number} port the new port to apply
 * @return {string} the new URL
 */
const changeOriginPort = (origin, port) => origin.replace(/(\/\/[a-zA-Z0-9-.]+:)\d+/, (_, match) => `${match}${port}`);

/**
 * Trasnform link with text string definition into object definition
 * @param {String} definition of link with text of format like '[TEXT](LINK)'
 * text and link enclosed with square and round brackets respectively
 * @returns {{name: String, href: String}} return object describing link with text
 */
const linkWithTextToObject = (definition) => {
    const name = definition.split(']').slice(1);
    const href = definition.split(name.length + 3, -1);
    return { name, href };
};

const { ALI_FLP_INDEX_URL, ALI_FLP_SUBPAGES_URLS } = process.env ?? {};
const LINKS_WITH_TEXT_SEPARATOR = ';;';

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
        index: ALI_FLP_INDEX_URL ? linkWithTextToObject(ALI_FLP_INDEX_URL) : { name: 'ALI FLP', href: changeOriginPort(origin, 8081) },
        other: ALI_FLP_SUBPAGES_URLS ? ALI_FLP_SUBPAGES_URLS.split(LINKS_WITH_TEXT_SEPARATOR).map(linkWithTextToObject) : undefined,
    },
};
