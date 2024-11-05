'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.sequelize.query(
            'UPDATE physical_constants SET value=0.7915057915057916 WHERE `key`=\'2#Z/A_PbPb\'',
            { transaction },
        );
        await queryInterface.sequelize.query(
            'UPDATE physical_constants SET value=1.000062503906494 WHERE `key`=\'2#Z/A_OO\'',
            { transaction },
        );
        await queryInterface.sequelize.query(
            'UPDATE physical_constants SET value=0.8226064437504761 WHERE `key`=\'2#Z/A_XeXe\'',
            { transaction },
        );
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.sequelize.query(
            'UPDATE physical_constants SET value=3.1792006972147466 WHERE `key`=\'2#Z/A_PbPb\'',
            { transaction },
        );
        await queryInterface.sequelize.query(
            'UPDATE physical_constants SET value=7.999974999960937 WHERE `key`=\'2#Z/A_OO\'',
            { transaction },
        );
        await queryInterface.sequelize.query(
            'UPDATE physical_constants SET value=22.916369695045503 WHERE `key`=\'2#Z/A_XeXe\'',
            { transaction },
        );
    }),
};
