/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

const { timestampToMysql } = require('../../../../server/utilities/timestampToMysql.js');

/**
 * Remove time segments of effective periods of flags assigned to
 * (Data Pass, Run, Dpl Detector) or (Simulation Pass, Run, Dpl Detector)
 * @param {QueryInterface} queryInterface sequelize interface
 * @param {Period} period period which discards other effective periods
 * @param {object} scope scope of QC flags
 * @param {number} scope.runNumber run number
 * @param {number} scope.dplDetectorId dpl detector id
 * @param {number} [scope.dataPassId] data pass id - exclusive with simulationPassId
 * @param {number} [scope.simulationPassId] simulation pass id - exclusive with dataPassId
 * @param {number} scope.createdAt creation timestamp of discarding period,
 * only effective periods of QC flags created before this timestamp will be updated
 * @return {Promise<void>} resolve once all periods were updated
 */
const _updateEffectivePeriodForScopeAndPeriod = async (
    queryInterface,
    period,
    { runNumber, dplDetectorId, dataPassId, simulationPassId, createdAt },
    { transaction },
) => {
    let joinClause =
    `
        INNER JOIN quality_control_flags as qcf
            ON qcfep.flag_id = qcf.id
                AND qcf.run_number = ${runNumber} 
                AND qcf.dpl_detector_id = ${dplDetectorId}
                AND qcf.created_at < '${timestampToMysql(createdAt)}'
    `;
    if (dataPassId !== undefined) {
        joinClause += `
            INNER JOIN data_pass_quality_control_flag as dpqcf
                ON dpqcf.quality_control_flag_id = qcf.id AND dpqcf.data_pass_id = ${dataPassId}
            `;
    } else if (simulationPassId !== undefined) {
        joinClause += `
            INNER JOIN simulation_pass_quality_control_flag as spqcf
                ON spqcf.quality_control_flag_id = qcf.id AND spqcf.simulation_pass_id = ${simulationPassId}
            `;
    } else {
        throw Error('Missing data pass or simulation pass id');
    }

    const intersectingPeriodFrom = timestampToMysql(period.from);
    const intersectingPeriodTo = timestampToMysql(period.to);

    // Delete effective periods fully covered by new flag
    await queryInterface.sequelize.query(
        `
            DELETE FROM qcfep
            USING quality_control_flag_effective_periods as qcfep
            ${joinClause}
            WHERE qcfep.\`from\` >= '${intersectingPeriodFrom}'
                AND qcfep.\`to\` <= '${intersectingPeriodTo}'
        `,
        { transaction },
    );

    //  Split effective periods which include new flag's period
    await queryInterface.sequelize.query(`
            INSERT INTO quality_control_flag_effective_periods (\`from\`, \`to\`, flag_id)
                SELECT qcfep.\`from\`, '${intersectingPeriodFrom}', qcfep.flag_id
                    FROM quality_control_flag_effective_periods as qcfep 
                    ${joinClause}
                    WHERE qcfep.\`from\` < '${intersectingPeriodFrom}'
                        AND '${intersectingPeriodTo}' < qcfep.\`to\`;

            `, { transaction });
    await queryInterface.sequelize.query(`
            INSERT INTO quality_control_flag_effective_periods (\`from\`, \`to\`, flag_id)
                SELECT '${intersectingPeriodTo}', qcfep.\`to\`, qcfep.flag_id
                    FROM quality_control_flag_effective_periods as qcfep 
                    ${joinClause}
                    WHERE qcfep.\`from\` < '${intersectingPeriodFrom}'
                        AND '${intersectingPeriodTo}' < qcfep.\`to\`;

            `, { transaction });
    await queryInterface.sequelize.query(
        `
            DELETE FROM qcfep
            USING quality_control_flag_effective_periods as qcfep
            ${joinClause}
            WHERE qcfep.\`from\` < '${intersectingPeriodFrom}'
                    AND '${intersectingPeriodTo}' < qcfep.\`to\`;
        `,
        { transaction },
    );

    // Shrink effective periods that start before new flag's period
    await queryInterface.sequelize.query(`
        UPDATE quality_control_flag_effective_periods as qcfep
        ${joinClause}
        SET qcfep.\`to\` = '${intersectingPeriodFrom}'
        WHERE qcfep.\`from\` < '${intersectingPeriodFrom}'
            AND qcfep.\`to\` > '${intersectingPeriodFrom}'
        ;
    `, { transaction });

    // Shrink effective periods that end after new flag's period
    await queryInterface.sequelize.query(`
        UPDATE quality_control_flag_effective_periods as qcfep
        ${joinClause}
        SET qcfep.\`from\` = '${intersectingPeriodTo}'
        WHERE qcfep.\`to\` > '${intersectingPeriodTo}'
            AND qcfep.\`from\` < '${intersectingPeriodTo}'
        ;
    `, { transaction });
};

/**
 * Assign appropriate effectivePeriods to all QC flags
 * @param {QueryInterface} queryInterface sequelize interface
 * @return {Promise<void>} resolve once all QC flags have proper effective periods assigned
 */
const _reconstructQcFlagsEffectivePeriods = async (queryInterface, { transaction }) => {
    const [qcFlagsPerDataPass] = await queryInterface.sequelize.query(`
        SELECT 
            \`from\`,
            \`to\`,
            qcf.created_at,
            run_number,
            dpl_detector_id,
            dpqcf.data_pass_id
        FROM quality_control_flags as qcf
        INNER JOIN data_pass_quality_control_flag as dpqcf
            ON qcf.id = dpqcf.quality_control_flag_id
        ORDER by qcf.created_at ASC
        ;
    `, { transaction });
    for (const flag of qcFlagsPerDataPass) {
        const {
            from,
            to,
            created_at: createdAt,
            run_number: runNumber,
            dpl_detector_id: dplDetectorId,
            data_pass_id: dataPassId,
        } = flag;
        await _updateEffectivePeriodForScopeAndPeriod(
            queryInterface,
            { from: from.getTime(), to: to.getTime() },
            { runNumber, dplDetectorId, dataPassId, createdAt: createdAt.getTime() },
            { transaction },
        );
    }

    const [qcFlagsPerSimulationPass] = await queryInterface.sequelize.query(`
        SELECT
            \`from\`,
            \`to\`,
            qcf.created_at,
            run_number,
            dpl_detector_id,
            spqcf.simulation_pass_id
        FROM quality_control_flags as qcf
        INNER JOIN simulation_pass_quality_control_flag as spqcf
            ON qcf.id = spqcf.quality_control_flag_id
        ORDER by qcf.created_at ASC
        ;
    `, { transaction });

    for (const flag of qcFlagsPerSimulationPass) {
        const {
            from,
            to,
            created_at: createdAt,
            run_number: runNumber,
            dpl_detector_id: dplDetectorId,
            simulation_pass_id: simulationPassId,
        } = flag;
        await _updateEffectivePeriodForScopeAndPeriod(
            queryInterface,
            { from: from.getTime(), to: to.getTime() },
            { runNumber, dplDetectorId, simulationPassId, createdAt: createdAt.getTime() },
            { transaction },
        );
    }
};

/**
 * Create effective period for every existing QC flag over its whole period
 * @param {QueryInterface} queryInterface sequelize interface
 * @return {Promise<void>} resolve once all QC flags has initial effective periods assigned
 */
const _populateQcFlagEffectivePeriod = async (queryInterface, { transaction }) => {
    await queryInterface.sequelize.query(
        `
        INSERT INTO quality_control_flag_effective_periods(flag_id, \`from\`, \`to\`)
            SELECT qcf.id, qcf.\`from\`, qcf.\`to\` from quality_control_flags qcf;`,
        { transaction },
    );
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.createTable('quality_control_flag_effective_periods', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            flag_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'quality_control_flags',
                    key: 'id',
                },
            },
            from: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            to: {
                type: Sequelize.DATE,
                allowNull: false,
            },

            // Timestamps
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
        }, { transaction });
        await _populateQcFlagEffectivePeriod(queryInterface, { transaction });
        await _reconstructQcFlagsEffectivePeriods(queryInterface, { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.dropTable('quality_control_flag_effective_periods', { transaction });
    }),
};
