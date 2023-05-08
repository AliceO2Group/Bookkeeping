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
const { frontUrl } = require('../../../../utilities/frontUrl.js');
const { RunDetectorQualities } = require('../../../../domain/enums/RunDetectorQualities.js');
const { indent } = require('../formatters.js');
const { eosReportFormatEorReason, eosReportFormatLog } = require('../formatters.js');

exports.formatQcPdpEosReportTypeSpecific = async ({ runs, runComments }) => {
    const entries = Object.entries(runs);
    let ret = '## Runs\n';

    if (entries.length === 0) {
        return `${ret}-`;
    }

    ret = `${ret}\n${(await Promise
        .all(entries.map(async ([definition, runs]) => await formatDefinitionPanel(definition, runs, runComments))))
        .join('\n\n')}`;

    return ret;
};

/**
 * Format all the runs for a given definition (called definition panel)
 *
 * @param {string} definition the definition of all the runs in the panel
 * @param {SequelizeRun[]} runs the list of runs with the given definition
 * @param {object} runComments the list of comments indexed by run number
 * @return {Promise<string>} the formatted definition panel
 */
const formatDefinitionPanel = async (definition, runs, runComments) => `\
### ${definition}
${runs.length > 0 ? (await Promise.all(runs.map((run) => formatRun(run, runComments[run.runNumber] ?? null)))).join('\n') : '-'}\
`;

/**
 * Format a given run to be displayed in a QC/PDP EoS report
 *
 * @param {SequelizeRun} run the run to format
 * @param {string} runComment eventually the comment attached to this run
 * @return {Promise<string>} the formatted run
 */
const formatRun = async (run, runComment) => {
    const { formatRunDuration } = await import('../../../../public/utilities/formatting/formatRunDuration.mjs');
    const detectors = [];
    const badQualityDetectors = [];
    for (const detector of run.detectors) {
        detectors.push(detector);
        if (detector.RunDetectors?.quality === RunDetectorQualities.BAD) {
            badQualityDetectors.push(detector);
        }
    }

    const lines = [
        `- [${run.runNumber}](${frontUrl({ page: 'run-detail', id: run.id })}) - ${formatRunDuration(run)} - ${run.runQuality}`,
        indent(`* Detectors: ${formatDetectors(detectors)}`),
        indent(`* Detectors QC bad: ${formatDetectors(badQualityDetectors)}`),
    ];

    if (run.eorReasons?.length > 0) {
        lines.push(indent(`* EOR:\n${indent(run.eorReasons.map((eorReason) => `* ${eosReportFormatEorReason(eorReason)}`).join('\n'))}`));
    }

    if (run.logs.length > 0) {
        lines.push(indent(`* Logs:\n${indent(run.logs.map((log) => `* ${eosReportFormatLog(log)}`).join('\n'))}`));
    }

    if (runComment) {
        lines.push(indent(`* Comment:\n${indent(runComment, '  ')}`));
    }

    return lines.join('\n');
};

/**
 * Format the given list of detectors to be displayed in QC/PDP EoS report
 *
 * @param {SequelizeDetector[]} detectors the list of detectors
 * @return {string} the formatted list
 */
const formatDetectors = (detectors) => detectors.length > 0
    ? detectors.map(({ name }) => `\`${name}\``).join(', ')
    : '-';
