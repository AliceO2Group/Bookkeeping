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
const { frontUrl } = require('../../../utilities/frontUrl.js');

const newLineRegex = new RegExp('(\\r?\\n)', 'g');

/**
 * Indent the given string with the given indentation
 * @param {string} toIndent the string to indent
 * @param {string} [indentation='    '] the indentation to apply, default to 4 spaces
 * @return {string} the indented result
 */
exports.indent = (toIndent, indentation = '    ') => `${indentation}${toIndent.replace(newLineRegex, `$1${indentation}`)}`;

/**
 * Format the given log to be displayed in an EOS report
 *
 * @param {SequelizeLog} log the log to format
 * @return {string} the formatted logs
 */
exports.eosReportFormatLog = (log) => `\\[${eosReportFormatTags(log.tags)}\\] - [${log.title}](${frontUrl({ page: 'log-detail', id: log.id })})`;

/**
 * Format the given EOR reason to be displayed in the ECS EOS report
 *
 * @param {EorReason} eorReason the end of run reason type
 * @return {string} the formatted EOR reason
 */
exports.eosReportFormatEorReason = ({ reasonType, description }) => {
    let ret = reasonType.category;
    if (reasonType.title) {
        ret += ` - ${reasonType.title}`;
    }
    ret += ` - ${description}`;
    return ret;
};

/**
 * Format the given tags to be displayed in an EOS report
 *
 * @param {SequelizeTag[]} tags the tags to be displayed
 * @return {string} the formatted tags
 */
const eosReportFormatTags = (tags) => `${tags.length > 0 ? tags.map(({ text }) => text).join(', ') : '**No tags**'}`;
