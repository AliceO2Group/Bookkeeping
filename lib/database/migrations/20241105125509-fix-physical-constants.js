'use strict';

// Fixes values set in 20231025101611-create-lhc-periods-view.js

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.sequelize.query(
            // 2 * ATOMIC_NUMBER /ATOMIC_MASS => 2 * 82 / 207.2
            'UPDATE physical_constants SET value=0.791505792 WHERE `key`=\'2#Z/A_PbPb\'',
            { transaction },
        );
        await queryInterface.sequelize.query(
            // 2 * ATOMIC_NUMBER /ATOMIC_MASS => 2 * 8 / 15.999
            'UPDATE physical_constants SET value=1.000062504 WHERE `key`=\'2#Z/A_OO\'',
            { transaction },
        );
        await queryInterface.sequelize.query(
            // 2 * ATOMIC_NUMBER /ATOMIC_MASS => 2 * 54 / 131.293
            'UPDATE physical_constants SET value=0.822587647 WHERE `key`=\'2#Z/A_XeXe\'',
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
