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
const { formatShiftDate } = require('../../shift/formatShiftDate.js');
const { indent } = require('../formatters.js');

/**
 * Format the given shift leader EoS report information
 *
 * @param {Shift} shift the shift for which report is being created
 * @param {ShiftLeaderEosReportTypeSpecific} typeSpecific Shift Leader EoS report specific information
 * @return {Promise<string>} resolves with the formatted Shift Leader specific part
 */
exports.formatShiftLeaderEosReportTypeSpecific = async (shift, { typeSpecific: { magnets, runs, tagsCounters } }) => {
    const sections = [
        `## Magnets\n${formatMagnetsSection(shift, magnets)}`,
        `## Statistics of the shift\n${formatStatisticsOfTheShift(tagsCounters)}`,
        `## Runs\n${await formatRunsSection(runs)}`,
    ];

    return sections.join('\n\n');
};

/**
 * Format the given magnet configuration
 *
 * @param {string} time the time of the magnet configuration
 * @param {string} solenoid the solenoid configuration
 * @param {string} dipole the dipole configuration
 * @return {string} the formatted magnet configuration
 */
const formatMagnetConfiguration = (time, solenoid, dipole) => `- ${time} - Solenoid ${solenoid} - Dipole ${dipole}`;

/**
 * Format the magnet section of the Shift Leader EoS report
 *
 * @param {Shift} shift the shift for which EoS report is generated
 * @param {EosReportMagnetInformation} magnets the magnet information
 * @return {string} the formatted magnet section
 */
const formatMagnetsSection = ({ start, end }, magnets) => {
    const sortableMagnets = magnets.intermediates;
    sortableMagnets.sort(({ timestamp: a }, { timestamp: b }) => a.localeCompare(b));

    const intermediates = sortableMagnets.map(({
        timestamp,
        magnetConfiguration: { solenoid, dipole },
    }) => formatMagnetConfiguration(timestamp, solenoid, dipole));

    return [
        `- ${formatShiftDate(start, { time: true })} - Solenoid ${magnets.start.solenoid} - Dipole ${magnets.start.dipole}`,
        ...intermediates,
        `- ${formatShiftDate(end, { time: true })} - Solenoid ${magnets.end.solenoid} - Dipole ${magnets.end.dipole}`,
    ].join('\n');
};

/**
 * Format the statistics of the shift section of the Shift Leader EoS report
 *
 * @param {SequelizeLog[]} tagsCounters the tags counters
 * @return {string} the formatted statistics section
 */
const formatStatisticsOfTheShift = (tagsCounters) => {
    const tagsCountersEntries = Object.entries(tagsCounters);
    return `- Bookkeeping entries per tags\n${indent(tagsCountersEntries.length > 0
        ? tagsCountersEntries.map(([tag, count]) => `- ${tag} (${count})`).join('\n')
        : '- **No entries**')
    }`;
};

/**
 * Format all the runs for a given definition (called definition panel)
 *
 * @param {string} definition the definition of all the runs in the panel
 * @param {SequelizeRun[]} runs the list of runs with the given definition
 * @return {Promise<string>} the formatted definition panel
 */
const formatDefinitionPanel = async (definition, runs) => `\
### ${definition} (${runs.length})
${runs.length > 0 ? (await Promise.all(runs.map((run) => formatRun(run)))).join('\n') : '-'}\
`;

/**
 * Format the runs section of the Shift Leader EoS report
 *
 * @param {Object<string, SequelizeRun[]>} runs the runs to format grouped by definition
 * @return {Promise<string>} resolves with the runs section
 */
const formatRunsSection = async (runs) => {
    const entries = Object.entries(runs);

    if (entries.length === 0) {
        return '-';
    } else {
        return `\n${(await Promise
            .all(entries.map(async ([definition, runs]) => await formatDefinitionPanel(definition, runs))))
            .join('\n\n')}`;
    }
};

/**
 * Format a given run to be displayed in a QC/PDP EoS report
 *
 * @param {SequelizeRun} run the run to format
 * @return {Promise<string>} the formatted run
 */
const formatRun = async (run) => `- [${run.runNumber}](${frontUrl({ page: 'run-detail', id: run.id })})`;
