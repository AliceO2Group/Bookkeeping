const { formatServerDate } = require('../../../utilities/formatServerDate.js');
const { createLog } = require('../../log/createLog.js');

/**
 * Log change of tags for a given run
 *
 * @param {number} runNumber the run number of the run
 * @param {string[]} previousTags the previous run's tags
 * @param {string[]} newTags the new run's tags
 * @param {string[]} logTags the tags to apply to the created log
 * @param {User|null} user the user that defined run's tags
 * @param {object} transaction an optional transaction
 * @return {Promise<void>} resolves once the log has been created
 */
exports.logSpecificRunTag = async (
    runNumber,
    previousTags,
    newTags,
    logTags,
    user,
    transaction,
) => {
    const textParts = [];
    if (previousTags.length === 0) {
        textParts.push(`The following tags has been added to run ${runNumber}: \`${newTags.join('`, `')}\``);
    } else if (newTags.length === 0) {
        textParts.push(`The following tags has been removed from run ${runNumber}: \`${previousTags.join('`, `')}\``);
    } else {
        textParts.push(`Run ${runNumber} tags has been changed from \`${previousTags.join('`, `')}\` to \`${newTags.join('`, `')}\``);
    }

    if (user) {
        textParts.push(`by ${user.name}`);
    }

    textParts.push(formatServerDate());

    await createLog(
        {
            title: `Run ${runNumber} tags has changed`,
            text: textParts.join(' '),
            subtype: 'run',
            origin: 'process',
        },
        [runNumber],
        logTags,
        [],
        [],
        [],
        transaction,
    );
};