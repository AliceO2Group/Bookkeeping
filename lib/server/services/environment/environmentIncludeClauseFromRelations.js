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

const { runIncludeClauseFromRelations } = require('../run/runIncludeClauseFromRelations.js');

/**
 * Returns the sequelize include expression that correspond to the given environment's relation specification
 *
 * @param {EnvironmentRelationsToInclude} [relations] the relations to include
 * @return {array} the include clause to pass to sequelize to include the selected relations
 */
exports.environmentIncludeClauseFromRelations = (relations) => {
    relations = relations || {};
    const include = [];

    if (relations.historyItems) {
        include.push('historyItems');
    }

    if (relations.runs) {
        if (typeof relations.runs === 'boolean') {
            include.push('runs');
        } else {
            include.push({
                association: 'runs',
                include: runIncludeClauseFromRelations(relations.runs.relations),
            });
        }
    }

    return include;
};
