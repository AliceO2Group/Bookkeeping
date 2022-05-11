'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        queryInterface.createTable('lhc_fills', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            stable_beams_start: {
                type: Sequelize.DATE,
                allowNull: true,
                default: null,
            },
            stable_beams_end: {
                type: Sequelize.DATE,
                allowNull: true,
                default: null,
            },
            stable_beams_duration: {
                type: Sequelize.INTEGER,
                allowNull: true,
                default: null,
            },
            beam_type: {
                type: Sequelize.ENUM('p-p', 'p-Pb', 'Pb-Pb'),
                allowNull: true,
                default: null,
            },
            filling_scheme_name: {
                type: Sequelize.CHAR(64),
                allowNull: true,
                default: null,
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
            },
        }, {
            timestamps: true,
        });
    },

    down: (queryInterface, _Sequelize) => queryInterface.dropTable('lhc_fills'),

};
