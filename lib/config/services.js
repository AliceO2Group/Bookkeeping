const { origin } = require('./httpConfig.js');

exports.services = {
    aliEcsGUI: {
        url: process.env?.ALI_ECS_GUI_URL || origin.replace(/(\/\/[a-zA-Z0-9-.]+:)\d+/, (_, match) => `${match}8080`),
        token: process.env?.ALI_ECS_GUI_TOKEN,
    },
};
