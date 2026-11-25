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
'use strict';

module.exports = {
    up: async (queryInterface) =>
        queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.bulkInsert('presentation_templates', [
                {
                    id: 1,
                    name: 'run-manager-weekly-report',
                    title: 'Run Manager Weekly Report',
                    description: 'The weekly report of the run manager for the Run Coordination meeting.',
                },
                {
                    id: 2,
                    name: 'lhc-fill-summary',
                    title: 'LHC Fill Summary',
                    description: 'A short summary of the LHC fills of the period and how efficiently their stable beams were used.',
                },
            ], { transaction });

            await queryInterface.bulkInsert('presentation_template_modules', [
                { presentation_template_id: 1, position: 0, type: 'title-slide', title: 'Run Manager Weekly Report' },
                { presentation_template_id: 1, position: 1, type: 'fill-calendar', title: 'Fills and runs' },
                { presentation_template_id: 1, position: 2, type: 'fill-efficiency', title: 'Fill efficiencies' },
                { presentation_template_id: 1, position: 3, type: 'running-time', title: 'Running time' },
                { presentation_template_id: 1, position: 4, type: 'eor-reasons', title: 'End of Run reasons' },
                { presentation_template_id: 2, position: 0, type: 'title-slide', title: 'LHC Fill Summary' },
                { presentation_template_id: 2, position: 1, type: 'fill-calendar', title: 'Fills and runs' },
                { presentation_template_id: 2, position: 2, type: 'fill-efficiency', title: 'Fill efficiencies' },
            ], { transaction });
        }),
    down: async (queryInterface) =>
        queryInterface.sequelize.transaction((transaction) =>
            Promise.all([queryInterface.bulkDelete('presentation_templates', null, { transaction })])),
};
