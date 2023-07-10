'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => Promise.all([
        queryInterface.bulkInsert('dpl_detectors', [
            { id: 1, name: 'CPV' },
            { id: 2, name: 'EMC' },
            { id: 3, name: 'FDD' },
            { id: 4, name: 'ITS' },
            { id: 5, name: 'FV0' },
            { id: 6, name: 'HMP' },
            { id: 7, name: 'FT0' },
            { id: 8, name: 'MCH' },
            { id: 9, name: 'MFT' },
            { id: 10, name: 'MID' },
            { id: 11, name: 'PHS' },
            { id: 12, name: 'TOF' },
            { id: 13, name: 'TPC' },
            { id: 14, name: 'TRD' },
            { id: 15, name: 'TST' },
            { id: 16, name: 'ZDC' },
            { id: 17, name: 'ACO' },
            { id: 18, name: 'CTP' },
            { id: 19, name: 'FIT' },
            { id: 20, name: 'QC-SPECIFIC' },
        ]),
    ]),

    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.bulkDelete('dpl_detectors', null, { transaction })])),
};
