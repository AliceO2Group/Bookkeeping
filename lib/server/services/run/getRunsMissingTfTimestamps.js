/**
 * Return the list of good physics runs with missing TF timestamps created after a given date
 *
 * @param {number} createdAfter the limit date before which one runs will be excluded
 * @return {Promise<SequelizeRun[]>} the list of runs that need updated TF timestamps
 */
const { RunRepository } = require('../../../database/repositories/index.js');
const { RunDefinition } = require('../../../domain/enums/RunDefinition.js');
const { Op } = require('sequelize');
const { RunQualities } = require('../../../domain/enums/RunQualities.js');

/**
 * Return the list of runs created after a given date that have missing TF timestamps (first AND last)
 *
 * @param {Date} createdAfter date after which runs must have been created
 * @return {Promise<SequelizeRun[]>} the list of runs
 */
exports.getGoodPhysicsRunsWithMissingTfTimestamps = async (createdAfter) => RunRepository.findAll({
    where: {
        definition: RunDefinition.PHYSICS,
        runQuality: RunQualities.GOOD,
        firstTfTimestamp: null,
        lastTfTimestamp: null,
        createdAt: { [Op.gte]: createdAfter },
    },
});
