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


            -- Prune QC flags which are out of run boundaries
            -- It's splitted into two queries because MariaDB fails due to FK constraint when performing one query
            -- 1) delete data-pass associations and verifications
            DELETE dpqcf, qcfv
            FROM data_pass_quality_control_flag as dpqcf
            INNER JOIN quality_control_flags as qcf
                ON dpqcf.quality_control_flag_id = qcf.id
            INNER JOIN runs as r    
                ON r.run_number = qcf.run_number
                AND r.run_number = NEW.run_number
            LEFT JOIN quality_control_flag_verifications as qcfv
                ON qcfv.flag_id = qcf.id
            WHERE qcf.\`to\` <= NEW.qc_time_start
                OR qcf.\`from\` >= NEW.qc_time_end;
            
            -- 2) delete the flags
            DELETE qcf
            FROM  quality_control_flags as qcf
            INNER JOIN runs as r
                ON r.run_number = qf.run_number
            WHERE qcf.\`to\` <= NEW.qc_time_start
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

// DROP TRIGGER qcf_boundaries_update_on_run_timestamps_update;

//     DELIMITER $$
//     CREATE TRIGGER qcf_boundaries_update_on_run_timestamps_update
//     AFTER UPDATE ON runs
//     FOR EACH ROW
//     BEGIN

//         IF OLD.qc_time_start <>= NEW.qc_time_start THEN

//             -- Update flags and their effective periods `from` timestamps
//             UPDATE quality_control_flags as qcf
//             INNER JOIN quality_control_flag_effective_periods as qcfep
//                 ON qcf.id = qcfep.flag_id
//             INNER JOIN runs as r    
//                 ON r.run_number = qcf.run_number
//                 AND r.run_number = NEW.run_number
//             SET qcf.`from` = null,
//                 qcfep.`from` = null
//             WHERE   qcf.`from` <= NEW.qc_time_start
//                 AND qcfep.`from` <= NEW.qc_time_start;
            
//         END IF;

//         IF OLD.qc_time_end <>= NEW.qc_time_end THEN

//             UPDATE quality_control_flags as qcf
//             INNER JOIN quality_control_flag_effective_periods as qcfep
//                 ON qcf.id = qcfep.flag_id
//             INNER JOIN runs as r    
//                 ON r.run_number = qcf.run_number
//                 AND r.run_number = NEW.run_number
//             SET qcf.`to` = null,
//                 qcfep.`to` = null
//             WHERE     qcf.`to` >= NEW.qc_time_end
//                 AND qcfep.`to` >= NEW.qc_time_end;

//         END IF;

//         IF OLD.qc_time_end <>= NEW.qc_time_end  OR OLD.qc_time_start <>= NEW.qc_time_start THEN

//         -- Prune effective periods which are out of run boundaries
//             DELETE qcfep
//             FROM quality_control_flag_effective_periods as qcfep
//             INNER JOIN quality_control_flags as qcf
//                 ON qcfep.flag_id = qcf.id
//             INNER JOIN runs as r    
//                 ON r.run_number = qcf.run_number
//                 AND r.run_number = NEW.run_number
//             WHERE qcfep.`to` <= NEW.qc_time_start
//                 OR qcfep.`from` >= NEW.qc_time_end;


//             -- Prune QC flags which are out of run boundaries
//             -- It's splitted into two queries because MariaDB fails due to FK constraint when performing one query
//             -- 1) - delete data-pass associations and verifications
//             -- DELETE dpqcf, qcfv
//             -- FROM  quality_control_flags as qcf
//             -- INNER JOIN runs as r    
//             --     ON r.run_number = qcf.run_number
//             --     AND r.run_number = NEW.run_number
//             -- LEFT JOIN data_pass_quality_control_flag as dpqcf
//             --     ON dpqcf.quality_control_flag_id = qcf.id
//             -- LEFT JOIN quality_control_flag_verifications as qcfv
//             --     ON qcfv.flag_id = qcf.id
//             -- WHERE qcf.`to` <= NEW.qc_time_start
//             --     OR qcf.`from` >= NEW.qc_time_end;

//             DELETE dpqcf
//             FROM  data_pass_quality_control_flag as dpqcf
//             INNER JOIN quality_control_flags as qcf
//                 ON dpqcf.quality_control_flag_id = qcf.id
//             INNER JOIN runs as r    
//                 ON r.run_number = qcf.run_number
//                 AND r.run_number = NEW.run_number
//             WHERE qcf.`to` <= NEW.qc_time_start
//                 OR qcf.`from` >= NEW.qc_time_end;

//             DELETE qcfv
//             FROM  quality_control_flags as qcf
//             INNER JOIN runs as r    
//                 ON r.run_number = qcf.run_number
//                 AND r.run_number = NEW.run_number
//             INNER JOIN quality_control_flag_verifications as qcfv
//                 ON qcfv.flag_id = qcf.id
//             WHERE qcf.`to` <= NEW.qc_time_start
//                 OR qcf.`from` >= NEW.qc_time_end;                
            
//             -- singal (
//             -- SELECT 1
//             -- FROM  quality_control_flags as qcf
//             -- WHERE qcf.`to` <= NEW.qc_time_start
//             --     OR qcf.`from` >= NEW.qc_time_end
//             -- );
//             INSERT INTO log (log) values ("new call");
//             INSERT INTO log
//             SELECT qcf.id
//             FROM  quality_control_flags as qcf
//             INNER JOIN runs as r
//                 ON r.run_number =  qcf.run_number
//                 AND r.run_number = NEW.run_number
//             WHERE qcf.`to` <= NEW.qc_time_start
//                 OR qcf.`from` >= NEW.qc_time_end;

//             -- 2) delete the flags
//             DELETE qcf
//             FROM  quality_control_flags as qcf
//             INNER JOIN runs as r
//                 ON r.run_number =  qcf.run_number
//                 AND r.run_number = NEW.run_number
//             WHERE qcf.`to` <= NEW.qc_time_start
//                 OR qcf.`from` >= NEW.qc_time_end;

//         END IF;

//     END; $$
//     DELIMITER ;
