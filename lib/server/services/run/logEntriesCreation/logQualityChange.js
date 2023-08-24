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
const { RunQualities } = require('../../../../domain/enums/RunQualities.js');
const { getTagsByText } = require('../../tag/getTagsByText.js');
const { createLog } = require('../../log/createLog.js');

/**
 * Create a log stating the run quality change
 *
 * @param {number} runNumber the run number of the run
 * @param {string} previousQuality the quality before update
 * @param {string} newQuality the quality after update
 * @param {Object} transaction the current transaction
 * @param {User|null} user if not null, the user mentioned in the log as the author of the update
 * @return {Promise<void>} resolve when log has been created
 * @private
 */
exports.logQualityChange = async (runNumber, previousQuality, newQuality, transaction, user) => {
    const textParts = [`The run quality for run ${runNumber} has been changed from ${previousQuality} to ${newQuality}`];
    if (user) {
        textParts.push(`by ${user.name}`);
    }
    textParts.push(formatServerDate());

    // Do not tag log only for good and bad qualities
    const TAGGED_LOG_QUALITIES = [RunQualities.GOOD, RunQualities.BAD];

    let tags = [];
    if (TAGGED_LOG_QUALITIES.includes(previousQuality) && TAGGED_LOG_QUALITIES.includes(newQuality)) {
        tags = (await getTagsByText(['DPG', 'RC'])).map(({ text }) => text);
    }

    const { error } = await createLog(
        {
            title: `Run ${runNumber} quality has changed to ${newQuality}`,
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
