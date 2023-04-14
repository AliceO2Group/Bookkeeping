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

const { getRunDefinition } = require('../../run/getRunDefinition.js');
const { frontUrl } = require('../../../../utilities/frontUrl.js');

/**
 * Returns the ECS specific part of a given EOS report
 *
 * @param {EcsEosReportTypeSpecific} ecsEorReportTypeSpecific the body of the report creation request
 * @return {Promise<string>} the ECS specific part
 */
exports.formatEcsEosReportTypeSpecific = async ({
    environments,
    environmentComments,
    runComments,
}) => formatEcsSpecificEosReport(environments.length > 0
    ? environments.map((environment) => formatEnvironment(environment, environmentComments, runComments)).join('\n\n')
    : '-');

/**
 * Format the given environment to be displayed in the ECS EOS report
 *
 * @param {SequelizeEnvironment} environment the environment to format
 * @param {object} environmentComments the list of environment comments
 * @param {object} runComments the list of run comments
 * @return {string} the formatted environment
 */
const formatEnvironment = (environment, environmentComments, runComments) => {
    let ret = `- (${environment.createdAt.getTime()}) [${environment.id}](${frontUrl({ page: 'env-details', environmentId: environment.id })})`;
    if (environment.runs.length > 0) {
        ret += `\n${environment.runs.map((run) => formatRun(run, runComments[run.runNumber] ?? null)).join('\n')}`;
    }
    if (environmentComments[environment.id]) {
        ret += `\n    * Comments:\n      ${environmentComments[environment.id].replaceAll(/(\r?\n)/g, '$1      ')}`;
    }
    return ret;
};

/**
 * Format the given run to be displayed in the ECS EOS report
 *
 * @param {SequelizeRun} run the run to format
 * @param {string|null} [comment] eventually the comment attached to the run
 * @return {string} the formatted run
 */
const formatRun = (run, comment) => {
    let ret = `    * (${run.timeTrgStart?.getTime() ?? run.timeO2Start?.getTime() ?? '-'})`
        + ` [${run.runNumber}](${frontUrl({ page: 'run-detail', id: run.id })}) - ${getRunDefinition(run)} - ${run.runQuality}`;
    if (run.eorReasons.length > 0) {
        ret += `\n        - EOR:\n${run.eorReasons.map(formatEorReason).join('\n')}`;
    }
    if (run.logs.length > 0) {
        ret += `\n        - Logs:\n${run.logs.map(formatLog).join('\n')}`;
    }
    if (comment) {
        ret += `\n        - Comment:\n          ${comment.replaceAll(/(\r?\n)/g, '$1          ')}`;
    }
    return ret;
};

/**
 * Format the given EOR reason to be displayed in the ECS EOS report
 *
 * @param {EorReason} eorReason the end of run reason type
 * @return {string} the formatted EOR reason
 */
const formatEorReason = ({ reasonType, description }) => {
    let ret = `            * ${reasonType.category}`;
    if (reasonType.title) {
        ret += ` - ${reasonType.title}`;
    }
    ret += ` - ${description}`;
    return ret;
};

/**
 * Format the given log to be displayed in the ECS EOS report
 *
 * @param {SequelizeLog} log the log to format
 * @return {string} the formatted logs
 */
const formatLog = (log) => `\
            * \\[${formatTags(log.tags)}\\] [${log.title}](${frontUrl({ page: 'log-detail', id: log.id })})\
`;

/**
 * Format the given tags to be displayed in the ECS EOS report
 *
 * @param {SequelizeTag[]} tags the tags to be displayed
 * @return {string} the formatted tags
 */
const formatTags = (tags) => `${tags.length > 0 ? tags.map(({ text }) => text).join(', ') : '**No tags**'}`;

/**
 * Returns the ECS specific EOS report for a given formatted list of environments
 *
 * @param {string} formattedEnvironmentEntries the formatted environments
 * @return {string} the formatted environment entries
 */
const formatEcsSpecificEosReport = (formattedEnvironmentEntries) => `\
## Environments and runs
${formattedEnvironmentEntries}\
`;
