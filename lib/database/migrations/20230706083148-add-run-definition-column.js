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

'use strict';

const { RUN_DEFINITIONS } = require('../../server/services/run/getRunDefinition.js');

const SET_PHYSICS_DEFINITION = `
    UPDATE runs r
        INNER JOIN lhc_fills lf
        ON r.fill_number = lf.fill_number
    SET definition = 'PHYSICS'
    WHERE r.dcs = 1
      AND r.dd_flp = 1
      AND r.epn = 1
      AND r.trigger_value = 'CTP'
      AND r.tfb_dd_mode IN ('processing', 'processing-disk')
      AND r.pdp_workflow_parameters LIKE '%CTF%'
      AND r.concatenated_detectors LIKE '%ITS%'
      AND r.concatenated_detectors LIKE '%FT0%'
      AND lf.stable_beams_start IS NOT NULL
      AND (r.time_o2_start IS NOT NULL OR r.time_trg_start IS NOT NULL)
      AND COALESCE(r.time_trg_start, r.time_o2_start) < lf.stable_beams_end
      AND COALESCE(r.time_trg_end, r.time_o2_end, NOW()) >= lf.stable_beams_start
    ;
`;

const SET_COSMICS_DEFINITION = `
    UPDATE runs r
        INNER JOIN run_types rt
        ON r.run_type_id = rt.id
    SET definition = 'COSMICS'
    WHERE r.definition IS NULL
      AND r.dcs = 1
      AND r.dd_flp = 1
      AND r.epn = 1
      AND r.trigger_value = 'CTP'
      AND r.tfb_dd_mode IN ('processing', 'processing-disk')
      AND r.pdp_workflow_parameters LIKE '%CTF%'
      AND rt.name IN ('cosmic', 'cosmics', 'COSMIC', 'COSMICS')
      AND (r.lhc_beam_mode IS NULL OR r.lhc_beam_mode = 'NO BEAM')
    ;
`;

const SET_TECHNICAL_DEFINITION = `
    UPDATE runs r
        INNER JOIN run_types rt
        ON r.run_type_id = rt.id
    SET definition = 'TECHNICAL'
    WHERE r.definition IS NULL
      AND rt.name IN ('technical', 'TECHNICAL')
      AND pdp_beam_type = 'technical';
`;

const SET_SYNTHETIC_DEFINITION = `
    UPDATE runs r
    SET r.definition = 'SYNTHETIC'
    WHERE r.definition IS NULL
      AND r.dcs = 0
      AND r.trigger_value = 'OFF'
      AND readout_cfg_uri LIKE '%replay%'
      AND (readout_cfg_uri LIKE '%pp%' OR readout_cfg_uri LIKE '%pbpb%')
`;

const SET_CALIBRATION_DEFINITION = `
    UPDATE runs r
        INNER JOIN run_types rt ON r.run_type_id = rt.id
    SET r.definition = 'CALIBRATION'
    WHERE r.definition IS NULL
      AND (rt.name LIKE 'CALIBRATION_%'
        OR rt.name LIKE 'PEDESTAL%'
        OR rt.name LIKE 'LASER%'
        OR rt.name LIKE 'PULSER%'
        OR rt.name LIKE 'NOISE%')
`;

const SET_COMMISSIONNING_DEFINITION = `
    UPDATE runs r
    SET r.definition = 'COMMISSIONING'
    WHERE r.definition IS NULL
`;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.addColumn('runs', 'definition', {
            type: Sequelize.ENUM(...RUN_DEFINITIONS),
        }, { transaction });
        await queryInterface.sequelize.query(SET_PHYSICS_DEFINITION, { transaction });
        await queryInterface.sequelize.query(SET_COSMICS_DEFINITION, { transaction });
        await queryInterface.sequelize.query(SET_TECHNICAL_DEFINITION, { transaction });
        await queryInterface.sequelize.query(SET_SYNTHETIC_DEFINITION, { transaction });
        await queryInterface.sequelize.query(SET_CALIBRATION_DEFINITION, { transaction });
        await queryInterface.sequelize.query(SET_COMMISSIONNING_DEFINITION, { transaction });
        await queryInterface.changeColumn('runs', 'definition', {
            type: Sequelize.ENUM(...RUN_DEFINITIONS),
            allowNull: false,
        }, { transaction });
    }),

    down: async (queryInterface) => {
        await queryInterface.removeColumn('runs', 'definition');
    },
};
