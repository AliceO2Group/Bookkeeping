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

// eslint-disable-next-line require-jsdoc
const toSqlDate = (timestamp) => `'${new Date(timestamp).toISOString().replace(/T/, ' ').slice(0, -5)}'`;

/**
 * Make existing flag discarded for certain period dependent on other QC flag
 * @param {QueryInterface} queryInterface sequelize interface
 * @param {QcFlag|SequelizeQcFlag} newerFlag newly created flag
 * @param {QcFlag|SequelizeQcFlag} flagToBePartiallyDiscarded flag to be updated
 * @return {Promise<void>} promise
 */
const _reconsturctEffectivePeriodForOneFlag = async (queryInterface, newerFlag, flagToBePartiallyDiscarded, { transaction }) => {
    const { from: newFlagFrom, to: newFlagTo } = newerFlag;

    const { id: flagToBePartiallyDiscardedId, from, to } = flagToBePartiallyDiscarded;
    if (newFlagTo <= from || to <= newFlagFrom) {
        return;
    }

    const [effectivePeriodsOfFlagToBePartiallyDiscarded] = await queryInterface.sequelize.query(`
        SELECT *
        FROM quality_control_flag_effective_periods
        WHERE flag_id = ${flagToBePartiallyDiscardedId}
            AND (
                    unix_timestamp(\`from\`) * 1000 >= ${newFlagFrom.getTime()} 
                    AND unix_timestamp(\`from\`) * 1000 <= ${newFlagTo.getTime()}
                OR
                    unix_timestamp(\`to\`) * 1000 >= ${newFlagFrom.getTime()}
                    AND unix_timestamp(\`to\`) * 1000 <= ${newFlagTo.getTime()}
            )

    `, { transaction });

    for (const effectivePeriod of effectivePeriodsOfFlagToBePartiallyDiscarded) {
        const { id: effectivePeriodId, from: effectiveFrom, to: effectiveTo } = effectivePeriod;

        if (newFlagFrom <= effectiveFrom && effectiveTo <= newFlagTo) { // Old flag is fully covered by new one
            await queryInterface.sequelize.query(
                `DELETE FROM quality_control_flag_effective_periods WHERE id = ${effectivePeriodId}`,
                { transaction },
            );
        } else if (effectiveFrom < newFlagFrom && newFlagTo < effectiveTo) { // New flag's period is included in old one's period
            await queryInterface.sequelize.query(`
                UPDATE quality_control_flag_effective_periods
                SET \`to\` = ${toSqlDate(newFlagFrom)}
                WHERE id = ${effectivePeriodId}
                ;
            `, { transaction });
            await queryInterface.sequelize(`
                INSERT INTO quality_control_flag_effective_periods(flag_id, \`from\`, \`to\`)
                VALUES (${flagToBePartiallyDiscardedId}, ${toSqlDate(newFlagTo)}, ${toSqlDate(effectiveTo)})
                ;
            `, { transaction });
        } else if (effectiveFrom < newFlagFrom) {
            await queryInterface.sequelize.query(`
                UPDATE quality_control_flag_effective_periods
                SET \`to\` = ${toSqlDate(newFlagFrom)}
                WHERE id = ${effectivePeriodId}
                ;
            `, { transaction });
        } else if (newFlagTo < effectiveTo) {
            await queryInterface.sequelize.query(`
                UPDATE quality_control_flag_effective_periods
                SET \`from\` = ${toSqlDate(newFlagTo)}
                WHERE id = ${effectivePeriodId}
                ;
            `, { transaction });
        } else {
            throw new Error('Incorrect state');
        }
    }
};

/**
 * Reconstruct effective period of all flags
 * @param {QueryInterface} queryInterface sequelize interface
 * @param {QcFlag} flags flags
 * @return {Promise<void>} promise
 */
const _reconsturctEffectivePeriodForFlagsInTheSameScope = async (queryInterface, flags, { transaction }) => {
    for (const i in flags) {
        const newerQcFlag = flags[i];
        const olderFlags = flags.slice(0, i);
        await Promise.all(olderFlags.map((flag) => _reconsturctEffectivePeriodForOneFlag(queryInterface, newerQcFlag, flag, { transaction })));
    }
};

/**
 * Reconstruct effective period of all flags
 * @param {QueryInterface} queryInterface sequelize interface
 * @return {Promise<void>} promise
 */
const _reconstructQcFlagsEffectivePeriods = async (queryInterface, { transaction }) => {
    const [qcFlagsPerDataPass] = await queryInterface.sequelize.query(`
        SELECT 
            qcf.id,
            \`from\`,
            \`to\`,
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
    `, { transaction }) || [];

    const groupedQcFlagsForDataPass = {};
    for (const flag of qcFlagsPerDataPass) {
        const {
            data_pass_id,
            run_number,
            dpl_detector_id,
        } = flag;
        if (!groupedQcFlagsForDataPass[data_pass_id]) {
            groupedQcFlagsForDataPass[data_pass_id] = {};
        }
        if (!groupedQcFlagsForDataPass[data_pass_id][run_number]) {
            groupedQcFlagsForDataPass[data_pass_id][run_number] = {};
        }
        if (!groupedQcFlagsForDataPass[data_pass_id][run_number][dpl_detector_id]) {
            groupedQcFlagsForDataPass[data_pass_id][run_number][dpl_detector_id] = [];
        }
        groupedQcFlagsForDataPass[data_pass_id][run_number][dpl_detector_id].push(flag);
    }

    for (const perRunDetector of Object.values(groupedQcFlagsForDataPass)) {
        for (const perDetector of Object.values(perRunDetector)) {
            for (const qcFlags of Object.values(perDetector)) {
                await _reconsturctEffectivePeriodForFlagsInTheSameScope(queryInterface, qcFlags, { transaction });
            }
        }
    }

    const [qcFlagsPerSimulationPass] = await queryInterface.sequelize.query(`
        SELECT 
            qcf.id,
            \`from\`,
            \`to\`,
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
    `, { transaction }) || [];

    const groupedQcFlagsForSimulationPass = {};
    for (const flag of qcFlagsPerSimulationPass) {
        const {
            simulation_pass_id,
            run_number,
            dpl_detector_id,
        } = flag;
        if (!groupedQcFlagsForSimulationPass[simulation_pass_id]) {
            groupedQcFlagsForSimulationPass[simulation_pass_id] = {};
        }
        if (!groupedQcFlagsForSimulationPass[simulation_pass_id][run_number]) {
            groupedQcFlagsForSimulationPass[simulation_pass_id][run_number] = {};
        }
        if (!groupedQcFlagsForSimulationPass[simulation_pass_id][run_number][dpl_detector_id]) {
            groupedQcFlagsForSimulationPass[simulation_pass_id][run_number][dpl_detector_id] = [];
        }
        groupedQcFlagsForSimulationPass[simulation_pass_id][run_number][dpl_detector_id].push(flag);
    }

    for (const perRunDetector of Object.values(groupedQcFlagsForSimulationPass)) {
        for (const perDetector of Object.values(perRunDetector)) {
            for (const qcFlags of Object.values(perDetector)) {
                await _reconsturctEffectivePeriodForFlagsInTheSameScope(queryInterface, qcFlags, { transaction });
            }
        }
    }
};

/**
 * Reset effective period of all QC flags
 * @param {QueryInterface} queryInterface sequelize interface
 * @return {Promise<void>} promise
 */
const _resetQcFlagEffectivePeriod = async (queryInterface, { transaction }) => {
    await queryInterface.sequelize.query('DELETE FROM quality_control_flag_effective_periods;', { transaction });
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
        // TODO update exisintg flags
        await _resetQcFlagEffectivePeriod(queryInterface, { transaction });
        await _reconstructQcFlagsEffectivePeriods(queryInterface, { transaction });
    }),

    down: async (queryInterface) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.dropTable('quality_control_flag_effective_periods', { transaction });
    }),
};
