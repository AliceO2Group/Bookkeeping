'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.renameColumn(
            'runs',
            'phase_shift_at_start',
            'phase_shift_at_start_beam1',
            { transaction },
        );
        await queryInterface.addColumn(
            'runs',
            'phase_shift_at_start_beam2',
            {
                type: Sequelize.DOUBLE,
                allowNull: true,
            },
            { transaction },
        );

        await queryInterface.renameColumn(
            'runs',
            'phase_shift_at_end',
            'phase_shift_at_end_beam1',
            { transaction },
        );
        await queryInterface.addColumn(
            'runs',
            'phase_shift_at_end_beam2',
            {
                type: Sequelize.DOUBLE,
                allowNull: true,
            },
            { transaction },
        );
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.renameColumn(
            'runs',
            'phase_shift_at_start_beam1',
            'phase_shift_at_start',
            { transaction },
        );
        await queryInterface.removeColumn(
            'runs',
            'phase_shift_at_start_beam2',
            { transaction },
        );

        await queryInterface.renameColumn(
            'runs',
            'phase_shift_at_end_beam1',
            'phase_shift_at_end',
            { transaction },
        );
        await queryInterface.removeColumn(
            'runs',
            'phase_shift_at_end_beam2',
            { transaction },
        );
    }),
};
