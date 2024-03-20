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

/**
 * Returns the sequelize include expression that correspond to the given run's relation specification
 *
 * @param {RunRelationsToInclude} [relations] the relations to include
 * @return {array} the include clause to pass to sequelize to include the selected relations
 */
exports.runIncludeClauseFromRelations = (relations) => {
    relations = relations || {};
    const include = [];

    if (relations.detectors) {
        include.push('detectors');
    }
    if (relations.eorReasons) {
        include.push({ association: 'eorReasons', include: 'reasonType' });
    }
    if (relations.flpRoles) {
        include.push('flpRoles');
    }
    if (relations.lhcFill) {
        include.push('lhcFill');
    }
    if (relations.runType) {
        include.push('runType');
    }
    if (relations.tags) {
        include.push('tags');
    }
    if (relations.logs) {
        include.push({ association: 'logs', include: 'tags' });
    }

    return include;
};
