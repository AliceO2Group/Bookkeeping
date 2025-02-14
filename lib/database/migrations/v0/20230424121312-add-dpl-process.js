'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    // eslint-disable-next-line require-jsdoc
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async () => {
            // DPL Hosts
            await queryInterface.createTable('hosts', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                },
                hostname: {
                    type: Sequelize.STRING,
                    allowNull: false,
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
            }, { timestamps: true });
            await queryInterface.addConstraint('hosts', {
                fields: ['hostname'],
                type: 'unique',
                name: 'unique_hostname_hosts',
            });

            // DPL detectors
            await queryInterface.createTable('dpl_detectors', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                },
                name: {
                    type: Sequelize.STRING,
                    allowNull: false,
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
            }, { timestamps: true });
            await queryInterface.addConstraint('dpl_detectors', {
                fields: ['name'],
                type: 'unique',
                name: 'unique_name_dpl_detectors',
            });

            // Process types
            await queryInterface.createTable('dpl_processes_types', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                },
                label: {
                    type: Sequelize.CHAR(32),
                    allowNull: false,
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
            await queryInterface.addConstraint('dpl_processes_types', {
                fields: ['label'],
                type: 'unique',
                name: 'unique_label_dpl_processes_types',
            });

            // DPL processes
            await queryInterface.createTable('dpl_processes', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                },
                name: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                type_id: {
                    type: Sequelize.INTEGER,
                    references: {
                        model: 'dpl_processes_types',
                        key: 'id',
                    },
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
            }, { timestamps: true });
            await queryInterface.addConstraint('dpl_processes', {
                fields: ['name', 'type_id'],
                type: 'unique',
                name: 'unique_name_type_id_dpl_processes',
            });

            // DPL executed processes
            await queryInterface.createTable('dpl_processes_executions', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                },
                run_number: {
                    allowNull: false,
                    type: Sequelize.INTEGER,
                    references: {
                        model: 'runs',
                        key: 'run_number',
                    },
                },
                detector_id: {
                    allowNull: false,
                    type: Sequelize.INTEGER,
                    references: {
                        model: 'dpl_detectors',
                        key: 'id',
                    },
                },
                process_id: {
                    allowNull: false,
                    type: Sequelize.INTEGER,
                    references: {
                        model: 'dpl_processes',
                        key: 'id',
                    },
                },
                host_id: {
                    type: Sequelize.INTEGER,
                    references: {
                        model: 'hosts',
                        key: 'id',
                    },
                },
                args: {
                    type: Sequelize.STRING,
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
        });
    },

    // eslint-disable-next-line require-jsdoc
    async down(queryInterface) {
        return queryInterface.sequelize.transaction(async () => {
            await queryInterface.dropTable('dpl_processes_executions');
            await queryInterface.dropTable('dpl_processes');
            await queryInterface.dropTable('dpl_processes_types');
            await queryInterface.dropTable('dpl_detectors');
            await queryInterface.dropTable('hosts');
        });
    },
};
