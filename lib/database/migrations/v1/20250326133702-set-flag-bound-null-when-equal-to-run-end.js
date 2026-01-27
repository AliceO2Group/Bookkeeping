'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(async () => {
        await queryInterface.sequelize.query(`UPDATE quality_control_flags qcf INNER JOIN runs r ON qcf.run_number = r.run_number
                                              SET qcf.\`from\` = NULL
                                              WHERE r.qc_time_start IS NOT NULL
                                                AND qcf.\`from\` = r.qc_time_start`);

        await queryInterface.sequelize.query(`UPDATE quality_control_flag_effective_periods qcfep
                                              INNER JOIN quality_control_flags qcf ON qcfep.flag_id = qcf.id
                                              INNER JOIN runs r ON qcf.run_number = r.run_number
                                              SET qcfep.\`from\` = NULL
                                              WHERE r.qc_time_start IS NOT NULL
                                                AND qcfep.\`from\` = r.qc_time_start`);

        await queryInterface.sequelize.query(`UPDATE quality_control_flags qcf INNER JOIN runs r ON qcf.run_number = r.run_number
                                              SET qcf.\`to\` = NULL
                                              WHERE r.qc_time_end IS NOT NULL
                                                AND qcf.\`to\` = r.qc_time_end`);

        await queryInterface.sequelize.query(`UPDATE quality_control_flag_effective_periods qcfep 
                                              INNER JOIN quality_control_flags qcf ON qcfep.flag_id = qcf.id
                                              INNER JOIN runs r ON qcf.run_number = r.run_number
                                              SET qcfep.\`to\` = NULL
                                              WHERE r.qc_time_end IS NOT NULL
                                                AND qcfep.\`to\` = r.qc_time_end`);
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async () => {
        await queryInterface.sequelize.query(`UPDATE quality_control_flags qcf INNER JOIN runs r ON qcf.run_number = r.run_number
                                              SET qcf.\`from\` = r.qc_time_start
                                              WHERE r.qc_time_start IS NOT NULL
                                                AND qcf.\`from\` IS NULL`);

        await queryInterface.sequelize.query(`UPDATE quality_control_flag_effective_periods qcfep
                                              INNER JOIN quality_control_flags qcf ON qcfep.flag_id = qcf.id
                                              INNER JOIN runs r ON qcf.run_number = r.run_number
                                              SET qcfep.\`from\` = r.qc_time_start
                                              WHERE r.qc_time_start IS NOT NULL
                                                AND qcfep.\`from\` IS NULL`);

        await queryInterface.sequelize.query(`UPDATE quality_control_flags qcf INNER JOIN runs r ON qcf.run_number = r.run_number
                                              SET qcf.\`to\` = r.qc_time_end
                                              WHERE r.qc_time_end IS NOT NULL
                                                AND qcf.\`to\` IS NULL`);

        await queryInterface.sequelize.query(`UPDATE quality_control_flag_effective_periods qcfep 
                                              INNER JOIN quality_control_flags qcf ON qcfep.flag_id = qcf.id
                                              INNER JOIN runs r ON qcf.run_number = r.run_number
                                              SET qcfep.\`to\` = r.qc_time_end
                                              WHERE r.qc_time_end IS NOT NULL
                                                AND qcfep.\`to\` IS NULL`);
    }),
};
