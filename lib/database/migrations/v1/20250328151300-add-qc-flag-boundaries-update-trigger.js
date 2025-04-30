'use strict';

const CREATE_QCF_BOUNDARIES_TRIGGER = `
    CREATE TRIGGER qcf_boundaries_update_on_run_timestamps_update
    AFTER UPDATE ON runs
    FOR EACH ROW
    BEGIN

        -- Update flags and their effective periods \`from\` timestamps
        IF OLD.qc_time_start <> NEW.qc_time_start THEN

            UPDATE quality_control_flags as qcf
            INNER JOIN quality_control_flag_effective_periods as qcfep
                ON qcf.id = qcfep.flag_id
            INNER JOIN runs as r    
                ON r.run_number = qcf.run_number
                AND r.run_number = NEW.run_number
            SET qcf.\`from\` = null,
                qcfep.\`from\` = null
            WHERE     qcf.\`from\` <= NEW.qc_time_start
                AND qcfep.\`from\` <= NEW.qc_time_start;
            
        END IF;

        -- Update flags and their effective periods \`to\` timestamps
        IF OLD.qc_time_end <> NEW.qc_time_end THEN

            UPDATE quality_control_flags as qcf
            INNER JOIN quality_control_flag_effective_periods as qcfep
                ON qcf.id = qcfep.flag_id
            INNER JOIN runs as r    
                ON r.run_number = qcf.run_number
                AND r.run_number = NEW.run_number
            SET qcf.\`to\` = null,
                qcfep.\`to\` = null
            WHERE     qcf.\`to\` >= NEW.qc_time_end
                AND qcfep.\`to\` >= NEW.qc_time_end;

        END IF;

        IF OLD.qc_time_end <> NEW.qc_time_end  OR  OLD.qc_time_start <> NEW.qc_time_start THEN

            -- Prune effective periods which are out of run boundaries
            DELETE qcfep
            FROM quality_control_flag_effective_periods as qcfep
            INNER JOIN quality_control_flags as qcf
                ON qcfep.flag_id = qcf.id
            INNER JOIN runs as r    
                ON r.run_number = qcf.run_number
                AND r.run_number = NEW.run_number
            WHERE  qcfep.\`to\`   <= NEW.qc_time_start
                OR qcfep.\`from\` >= NEW.qc_time_end;

            -- 2) delete the flags
            UPDATE quality_control_flags as qcf
            INNER JOIN runs as r
                ON r.run_number = qcf.run_number
                AND r.run_number = NEW.run_number
            SET qcf.deleted = 1
            WHERE  qcf.\`to\`   <= NEW.qc_time_start
                OR qcf.\`from\` >= NEW.qc_time_end;

        END IF;

    END;
`;

const DROP_QCF_BOUNDARIES_TRIGGER = `
    DROP TRIGGER qcf_boundaries_update_on_run_timestamps_update;
`;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => queryInterface.sequelize.transaction(() =>
        queryInterface.sequelize.query(CREATE_QCF_BOUNDARIES_TRIGGER)),

    down: async (queryInterface) => queryInterface.sequelize.transaction(() =>
        queryInterface.sequelize.query(DROP_QCF_BOUNDARIES_TRIGGER)),
};
