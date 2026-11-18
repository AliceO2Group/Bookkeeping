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

/**
 * Return the SQL expression of a magnet's signed current, rounded to kA
 *
 * @param {'l3'|'dipole'} magnet the magnet, as named in the runs table columns
 * @return {string} the SQL expression
 */
const currentLevelSql = (magnet) =>
    `ROUND(IF(alice_${magnet}_polarity = 'NEGATIVE', -1, 1) * alice_${magnet}_current / 1000)`;

exports.ALICE_L3_CURRENT_LEVEL_SQL = currentLevelSql('l3');

exports.ALICE_DIPOLE_CURRENT_LEVEL_SQL = currentLevelSql('dipole');
