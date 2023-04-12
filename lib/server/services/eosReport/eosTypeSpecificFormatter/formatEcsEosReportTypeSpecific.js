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

const ECS_EOR_REPORT_RUNS_LOGS_REQUIRED_TAGS = ['ECS', 'ECS Shifter'];

/**
 * Returns the ECS specific part of a given EOS report
 *
 * @param {EcsEosReportTypeSpecific} ecsEorReportTypeSpecific the body of the report creation request
 * @return {Promise<string>} the ECS specific part
 */
exports.formatEcsEosReportTypeSpecific = async ({ environments }) => formatEcsSpecificEosReport(environments.length > 0
    ? environments.map(formatEnvironment).join('\n\n')
    : '-');

/**
 * Format the given environment to be displayed in the ECS EOS report
 *
 * @param {SequelizeEnvironment} environment the environment to format
 * @return {string} the formatted environment
 */
const formatEnvironment = (environment) => {
    let ret = `- (${environment.createdAt.getTime()}) [${environment.id}](#)`;
    if (environment.runs.length > 0) {
        ret += `\n${environment.runs.map((run) => formatRun(run, filterLogs(run.logs))).join('\n')}`;
    }
    return ret;
};

/**
 * Format the given run to be displayed in the ECS EOS report
 *
 * @param {SequelizeRun} run the run to format
 * @param {SequelizeLog[]} filteredLogs the run's filtered logs
 * @return {string} the formatted run
 */
const formatRun = (run, filteredLogs) => {
    let ret = `    * (${run.timeTrgStart?.getTime() ?? run.timeO2Start?.getTime() ?? '-'})`
        + ` [${run.runNumber}](#) - ${getRunDefinition(run)} - ${run.runQuality}`;
    if (run.eorReasons.length > 0) {
        ret += `\n        - EOR:\n${run.eorReasons.map(formatEorReason).join('\n')}`;
    }
    if (filteredLogs.length > 0) {
        ret += `\n        - Logs:\n${filteredLogs.map(formatLog).join('\n')}`;
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
 * Filter the runs logs to be displayed in the report
 *
 * @param {SequelizeLog[]|undefined|null} [logs] the logs to display
 * @return {SequelizeLog[]} the filtered logs
 */
const filterLogs = (logs) => {
    if (!logs?.length) {
        return [];
    }

    return logs.filter(({ tags }) => tags.some(({ text }) => ECS_EOR_REPORT_RUNS_LOGS_REQUIRED_TAGS.includes(text)));
};

/**
 * Format the given log to be displayed in the ECS EOS report
 *
 * @param {SequelizeLog} log the log to format
 * @return {string} the formatted logs
 */
const formatLog = (log) => `\
            * \\[${log.tags.length > 0 ? log.tags.map(({ text }) => text).join(', ') : '**No tags**'}\\] [${log.title}](#)\
`;

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
