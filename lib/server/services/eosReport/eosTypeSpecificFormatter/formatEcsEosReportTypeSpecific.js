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
const { formatShiftDate } = require('../../shift/formatShiftDate.js');
const { indent, eosReportFormatLog, eosReportFormatEorReason } = require('../formatters.js');

/**
 * Returns the ECS specific part of a given EOS report
 *
 * @param {EcsEosReportTypeSpecific} ecsEosReportTypeSpecific the body of the report creation request
 * @return {Promise<string>} the ECS specific part
 */
exports.formatEcsEosReportTypeSpecific = async ({
    environments,
    environmentComments,
    runComments,
}) => formatEcsSpecificEosReport(environments.length > 0
    ? (await Promise.all(environments
        .map(async (environment) => await formatEnvironment(environment, environmentComments, runComments)))).join('\n\n')
    : '-');

/**
 * Format the given environment to be displayed in the ECS EOS report
 *
 * @param {SequelizeEnvironment} environment the environment to format
 * @param {object} environmentComments the list of environment comments
 * @param {object} runComments the list of run comments
 * @return {Promise<string>} the formatted environment
 */
const formatEnvironment = async (environment, environmentComments, runComments) => {
    const envUrl = frontUrl({ page: 'env-details', environmentId: environment.id });

    const formattedRuns = await Promise.all(environment.runs.map(async (run) => await formatRun(
        run,
        runComments[run.runNumber] ?? null,
    )));

    const lines = [
        `- (${formatShiftDate(environment.createdAt)}) [${environment.id}](${envUrl})`,
        ...formattedRuns,
    ];

    if (environmentComments[environment.id]) {
        // Indent the comment text with 2 spaces to be aligned with the 'Comment' word above upper
        lines.push(indent(`* Comments:\n${indent(environmentComments[environment.id], '  ')}`));
    }

    return lines.join('\n');
};

/**
 * Format the given run to be displayed in the ECS EOS report
 *
 * @param {SequelizeRun} run the run to format
 * @param {string|null} [comment] eventually the comment attached to the run
 * @return {Promise<string>} the formatted run
 */
const formatRun = async (run, comment) => {
    const { formatRunDuration } = await import('../../../../public/utilities/formatting/formatRunDuration.mjs');
    const start = run.timeTrgStart ?? run.timeO2Start;
    const lines = [
        `* (${start ? formatShiftDate(start) : '-'})`
        + ` [${run.runNumber}](${frontUrl({ page: 'run-detail', id: run.id })})`
        + ` - ${getRunDefinition(run)} - ${formatRunDuration(run)} - ${run.runQuality}`,
    ];

    if (run.eorReasons.length > 0) {
        lines.push(indent(`- EOR:\n${run.eorReasons.map((eorReason) => indent(`* ${eosReportFormatEorReason(eorReason)}`)).join('\n')}`));
    }
    if (run.logs.length > 0) {
        lines.push(indent(`- Logs:\n${run.logs.map((log) => indent(`* ${eosReportFormatLog(log)}`)).join('\n')}`));
    }
    if (comment) {
        // Indent the comment text with 2 spaces to be aligned with the 'Comment' word above upper
        lines.push(indent(`- Comment:\n${indent(comment, '  ')}`));
    }
    return indent(lines.join('\n'));
};

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
