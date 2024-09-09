'use strict';

const { Sequelize } = require('sequelize');
const { DetectorType, DETECTOR_TYPES } = require('../../../../domain/enums/DetectorTypes.js');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.addConstraint('run_detectors', {
            type: 'FOREIGN KEY',
            fields: ['run_number'],
            name: 'run_number_fk_run_detectors',
            references: {
                table: 'runs',
                field: 'run_number',
            },
        }, { transaction });

        await queryInterface.addConstraint('run_detectors', {
            type: 'FOREIGN KEY',
            fields: ['detector_id'],
            name: 'detector_id_fk_run_detectors',
            references: {
                table: 'detectors',
                field: 'id',
            },
            onUpdate: 'CASCADE',
        }, { transaction });

        await queryInterface.addColumn(
            'detectors',
            'type',
            { type: Sequelize.ENUM(...DETECTOR_TYPES), allowNull: false },
            { transaction },
        );
        await queryInterface.sequelize.query(`
        UPDATE detectors
            SET type = '${DetectorType.PHYSICAL}'
        `, { transaction });

        await queryInterface.sequelize.query(`
        UPDATE detectors
            SET type = '${DetectorType.VIRTUAL}'
            WHERE name = 'TST'
        `, { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.removeConstraint('run_detectors', 'detector_id_fk_run_detectors', { transaction });
        await queryInterface.removeConstraint('run_detectors', 'run_number_fk_run_detectors', { transaction });

        await queryInterface.removeColumn('detectors', 'type', { transaction });
    }),
};
