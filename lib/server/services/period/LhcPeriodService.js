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

const { LhcPeriodRepository } = require('../../../database/repositories');
const { dataSource } = require('../../../database/DataSource.js');
const { Sequelize } = require('sequelizse');

/**
 * @typedef LhcPeriodIdentifier object to uniquely identify a lhc period
 * @property {string} [name] the lhc period name
 * @property {number} [id] the id of lhc period
 */

/**
 * LhcPeriodService
 */
class LhcPeriodService {
    /**
     * Find or create a lhc period model by its name or id
     * @param {LhcPeriodIdentifier} identifier the criteria to find run type
     * @return {Promise<SequelizeLhcPeriod[]>} the run type found or null
     */
    async getById({ id, name }) {
        return await LhcPeriodRepository.findOne({ id, name });
    }

    // eslint-disable-next-line require-jsdoc
    async getAllForPhysicsRuns(dto = {}) {
        const { query = {} } = dto;
        const { filter, page = {}, sort = { name: 'desc' } } = query;

        const additionalFields = [
            [
                Sequelize.fn(
                    'avg',
                    Sequelize.fn('get_center_of_mass_energy', Sequelize.col('Runs.energy_per_beam'), Sequelize.col('BeamType.id')),
                ),
                'avgEnergy',
            ],
            [
                Sequelize.fn('array_agg', Sequelize.fn('DISTINCT', Sequelize.col('Runs.energy_per_beam'))),
                'distinctEnergies',
            ],
            [Sequelize.fn('count', Sequelize.fn('DISTINCT', Sequelize.col('Runs.run_number'))), 'runsCount'],
            [Sequelize.fn('count', Sequelize.fn('DISTINCT', Sequelize.col('DataPasses.id'))), 'dataPassesCount'],
            [Sequelize.fn('count', Sequelize.fn('DISTINCT', Sequelize.col('SimulationPasses.id'))), 'simulationPassesCount'],
        ];

        const baseClause = {
            include: [
                {
                    model: 'runs',
                    required: true,
                    attributes: [],
                    where: {
                        definition: 'PHYSICS',
                    },
                },
            ],
            attributes: {
                include: additionalFields,
            },

            group: [
                'Period.id',
            ],
            subQuery: false,
        };
    }
}

exports.LhcPeriodService = LhcPeriodService;

exports.lhcPeriodservice = new LhcPeriodService();
