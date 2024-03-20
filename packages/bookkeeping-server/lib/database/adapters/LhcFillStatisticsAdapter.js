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
 * Adapter for LHC fill statistics
 */
class LhcFillStatisticsAdapter {
    /**
     * Convert from sequelize model to entity
     *
     * @param {SequelizeLhcFillStatistics} databaseObject the fill statistics to convert
     * @return {LhcFillStatistics} the resulting entity
     */
    toEntity(databaseObject) {
        const {
            fillNumber,
            runsCoverage,
            efficiency,
            timeLossAtStart,
            efficiencyLossAtStart,
            timeLossAtEnd,
            efficiencyLossAtEnd,
            meanRunDuration,
            totalCtfFileSize,
            totalTfFileSize,
        } = databaseObject;

        return {
            fillNumber,
            // Convert to ms
            runsCoverage: runsCoverage * 1000,
            efficiency: parseFloat(efficiency),
            // Convert to ms
            timeLossAtStart: timeLossAtStart * 1000,
            efficiencyLossAtStart: parseFloat(efficiencyLossAtStart),
            // Convert to ms
            timeLossAtEnd: timeLossAtEnd * 1000,
            efficiencyLossAtEnd: parseFloat(efficiencyLossAtEnd),
            meanRunDuration: parseFloat(meanRunDuration) * 1000,
            totalCtfFileSize,
            totalTfFileSize,
        };
    }
}

exports.LhcFillStatisticsAdapter = LhcFillStatisticsAdapter;
