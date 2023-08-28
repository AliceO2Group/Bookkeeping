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

const { formatServerDate } = require('../../../utilities/formatServerDate.js');
const { getTagsByText } = require('../../tag/getTagsByText.js');
const { createLog } = require('../../log/createLog.js');

/**
 * Log a calibration status going to "failed"
 *
 * @param {number} runNumber the run number of the run for which calibration status changed
 * @param {string} previousCalibrationStatus the previous calibration status
 * @param {string} newCalibrationStatus the new calibration status
 * @param {SequelizeRunDetector[]} runDetectors the list of detectors (should be only one) that are linked to the run
 * @param {object} transaction an optional transaction in which log creation must run
 * @param {User|null} user the user that did the modification
 * @param {string} [reason] if it applies, the reason of the change
 * @return {Promise<void>} resolves once the log has been created
 */
exports.logCalibrationStatusChange = async (
    runNumber,
    previousCalibrationStatus,
    newCalibrationStatus,
    runDetectors,
    transaction,
    user,
    reason,
) => {
    const textParts =
        [`The calibration status for run ${runNumber} has been changed from ${previousCalibrationStatus} to ${newCalibrationStatus}`];

    if (user) {
        textParts.push(`by ${user.name}`);
    }

    textParts.push(formatServerDate());

    if (reason) {
        textParts.push('\n');
        textParts.push(`Reason: ${reason}`);
    }

    const tags = (await getTagsByText(runDetectors.map(({ name }) => name))).map(({ text }) => text);
    const { error } = await createLog(
        {
            title: `Run ${runNumber} calibration status has changed to ${newCalibrationStatus}`,
            text: textParts.join(' '),
            subtype: 'run',
            origin: 'process',
        },
        [runNumber],
        tags,
        [],
        [],
        transaction,
    );
    if (error) {
        // TODO [O2B-967] log the failed log creation
    }
};
