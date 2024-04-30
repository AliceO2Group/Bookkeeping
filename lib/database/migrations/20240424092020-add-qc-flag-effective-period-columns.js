/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

const { timestampToMysql } = require('../../server/utilities/timestampToMysql');

/**
 * Discard effective periods of flags belonging to given scope
 * @param {QueryInterface} queryInterface sequelize interface
 * @param {Period} period period which discards other effective periods
 * @param {object} scope scope of QC flags
 * @param {object} scope.runNumber run number
 * @param {object} scope.dplDetectorId dpl detector id
 * @param {object} [scope.dataPassId] data pass id - exclusive with simulationPassId
 * @param {object} [scope.simulationPassId] simulation pass id - exclusive with dataPassId
 * @param {object} scope.createdAt creation timestamp of discarding flag,
 * only effective periods of QC flags created before this timestamp will be updated
 * @return {Promise<void>} promise
 */
const _reconstructEffectivePeriodForScopeAndPeriod = async (
    queryInterface,
    { from: intersecingPeriodFrom, to: intersectingPeriodTo },
    { runNumber, dplDetectorId, dataPassId, simulationPassId, createdAt },
    { transaction },
) => {
    const [effectivePeriodsOfFlagToBePartiallyDiscarded] = await queryInterface.sequelize.query(`
        SELECT qcfep.id, qcfep.flag_id, qcfep.\`from\`, qcfep.\`to\`

        FROM quality_control_flag_effective_periods as qcfep
        INNER JOIN quality_control_flags as qcf
            ON qcfep.flag_id = qcf.id
                AND qcf.run_number = ${runNumber} 
                AND qcf.dpl_detector_id = ${dplDetectorId}
        INNER JOIN ${
    dataPassId !== undefined
        ? `data_pass_quality_control_flag as dpqcf
                    ON dpqcf.quality_control_flag_id = qcf.id AND dpqcf.data_pass_id = ${dataPassId}
                    `
        : `simulation_pass_quality_control_flag as spqcf
                    ON spqcf.quality_control_flag_id = qcf.id AND spqcf.simulation_pass_id = ${simulationPassId}
                    `
}
        WHERE   
            unix_timestamp(qcfep.\`from\`) * 1000 < ${intersectingPeriodTo} 
                AND unix_timestamp(qcfep.\`to\`) * 1000 > ${intersecingPeriodFrom}
                AND unix_timestamp(qcf.created_at) * 1000 < ${createdAt}
    `, { transaction });

    for (const effectivePeriod of effectivePeriodsOfFlagToBePartiallyDiscarded) {
        const { id: effectivePeriodId, from: effectiveFrom, to: effectiveTo, flag_id: flagId } = effectivePeriod;

        if (intersecingPeriodFrom <= effectiveFrom && effectiveTo <= intersectingPeriodTo) { // Old flag is fully covered by new one
            await queryInterface.sequelize.query(
                `DELETE FROM quality_control_flag_effective_periods WHERE id = ${effectivePeriodId}`,
                { transaction },
            );
        } else if (effectiveFrom < intersecingPeriodFrom && intersectingPeriodTo < effectiveTo) {
            // New flag's period is included in old one's period
            await queryInterface.sequelize.query(`
                UPDATE quality_control_flag_effective_periods
                SET \`to\` = '${timestampToMysql(intersecingPeriodFrom)}'
                WHERE id = ${effectivePeriodId}
                ;
            `, { transaction });
            await queryInterface.sequelize.query(`
                INSERT INTO quality_control_flag_effective_periods(flag_id, \`from\`, \`to\`)
                VALUES (${flagId}, '${timestampToMysql(intersectingPeriodTo)}', '${timestampToMysql(effectiveTo)}')
                ;
            `, { transaction });
        } else if (effectiveFrom < intersecingPeriodFrom) {
            await queryInterface.sequelize.query(`
                UPDATE quality_control_flag_effective_periods
                SET \`to\` = '${timestampToMysql(intersecingPeriodFrom)}'
                WHERE id = ${effectivePeriodId}
                ;
            `, { transaction });
        } else if (intersectingPeriodTo < effectiveTo) {
            await queryInterface.sequelize.query(`
                UPDATE quality_control_flag_effective_periods
                SET \`from\` = '${timestampToMysql(intersectingPeriodTo)}'
                WHERE id = ${effectivePeriodId}
                ;
            `, { transaction });
        } else {
            throw new Error('Incorrect state');
        }
    }
};

/**
 * Assign appropriate effectivePeriods to all QC flags
 * @param {QueryInterface} queryInterface sequelize interface
 * @return {Promise<void>} promise
 */
const _reconstructQcFlagsEffectivePeriods = async (queryInterface, { transaction }) => {
    const [qcFlagsPerDataPass] = await queryInterface.sequelize.query(`
        SELECT 
            \`from\`,
            \`to\`,
            qcf.created_at,
            run_number,
            dpl_detector_id,
            dp.id as data_pass_id
        FROM quality_control_flags as qcf
        INNER JOIN data_pass_quality_control_flag as dpqcf
            ON qcf.id = dpqcf.quality_control_flag_id
        INNER JOIN data_passes as dp
            ON dp.id = dpqcf.data_pass_id
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
        await _reconstructEffectivePeriodForScopeAndPeriod(
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
            sp.id as simulation_pass_id
        FROM quality_control_flags as qcf
        INNER JOIN simulation_pass_quality_control_flag as spqcf
            ON qcf.id = spqcf.quality_control_flag_id
        INNER JOIN simulation_passes as sp
            ON sp.id = spqcf.simulation_pass_id
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
        await _reconstructEffectivePeriodForScopeAndPeriod(
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
 * @return {Promise<void>} promise
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
