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

const { Op } = require('sequelize');
const { models: { QcFlag } } = require('..');
const Repository = require('./Repository');

/**
 * Sequelize implementation of the QcFlagRepository
 */
class QcFlagRepository extends Repository {
    /**
     * Creates a new `QcFlagRepository` instance.
     */
    constructor() {
        super(QcFlag);
    }

    /**
     * Find all QC flags created before and after given one for the same run, detector, data/simulation pass
     * @param {QcFlag} qcFlagId id of QC flag
     * @return {Promise<{ after: QcFlag[], before: QcFlag[] }>} QC flags created before and after given one
     */
    async findFlagsCreatedAfterAndBeforeGivenOne(qcFlagId) {
        const qcFlag = await this.findOne({
            where: { id: qcFlagId },
            include: [{ association: 'dataPasses' }, { association: 'simulationPasses' }],
        });
        const { runNumber, dplDetectorId, createdAt, dataPasses, simulaitonPasses } = qcFlag;

        if (!dataPasses || !simulaitonPasses) {
            const missingAssociations = [];
            if (!dataPasses) {
                missingAssociations.push('`dataPasses`');
            }
            if (!simulaitonPasses) {
                missingAssociations.push('`simulationPasses');
            }
            throw new Error(`${missingAssociations} association${missingAssociations.length === 2 ? 's are' : ' is'} missing`);
        }

        const dataPassId = dataPasses[0]?.id;
        const simulationPassId = simulaitonPasses[0]?.id;

        const flagIncludes = [];
        let synchronousQcWhereClause = {};

        // QC flag can be associated with only one data pass or only one simulation pass or be synchronous
        if (dataPassId !== undefined) {
            flagIncludes.push({ association: 'dataPasses', where: { id: dataPassId }, required: true });
        } else if (simulationPassId !== undefined) {
            flagIncludes.push({ association: 'simulationPasses', where: { id: simulationPassId }, required: true });
        } else {
            flagIncludes.push({ association: 'dataPasses', required: false });
            flagIncludes.push({ association: 'simulationPasses', required: false });
            synchronousQcWhereClause = { '$flag->dataPasses.id$': null, '$flag->simulationPasses.id$': null };
        }

        const flagsCreatedAfterRemovedFlag = await QcFlagRepository.findAll({
            where: {
                dplDetectorId,
                runNumber,
                createdAt: { [Op.gt]: createdAt },
                ...synchronousQcWhereClause,
            },
            include: flagIncludes,
            sort: [['createdAt', 'ASC']],
        });

        const flagsCreatedBeforeRemovedFlag = await QcFlagRepository.findAll({
            where: {
                dplDetectorId,
                runNumber,
                createdAt: { [Op.lte]: createdAt },
                ...synchronousQcWhereClause,
            },
            include: flagIncludes,
            sort: [['createdAt', 'ASC']],
        });

        return {
            before: flagsCreatedBeforeRemovedFlag,
            after: flagsCreatedAfterRemovedFlag,
        };
    }
}

module.exports = new QcFlagRepository();
