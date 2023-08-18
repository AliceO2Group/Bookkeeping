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
const { getShiftFromTimestamp, SHIFT_DURATION } = require('./getShiftFromTimestamp.js');
const { getUserOrFail } = require('../user/getUserOrFail.js');
const { logAdapter, environmentAdapter, runAdapter } = require('../../../database/adapters/index.js');
const { getShiftIssues } = require('../eosReport/getShiftIssues.js');
const { ShiftTypes } = require('../../../domain/enums/ShiftTypes.js');
const { getShiftEnvironments } = require('./getShiftEnvironments.js');
const { getShiftTagsFiltersByType } = require('./getShiftTagsFiltersByType.js');
const { getShiftRuns } = require('./getShiftRuns.js');
const { getShiftIssuesTagsOccurrences } = require('../log/getShiftIssuesTagsOccurrences.js');
const { formatEosReportTitle } = require('../eosReport/formatEosReport.js');
const { getLogsByTitle } = require('../log/getLogsByTitle.js');

// Time after the end of the shift during which one the user is allowed to fill the EOS report (currently 30 minutes)
const PENDING_SHIFT_MARGIN = 30 * 60 * 1000;

/**
 * Service to generate end of shift report
 */
class ShiftService {
    /**
     * Returns the shift of the user for which EOS can be created
     *
     * @param {UserIdentifier} shifterUserIdentifier the identifier of the shifter
     * @return {Promise<Shift>} resolves with the user's the shift if it exists, else reject
     */
    async getUserPendingShiftOrFail(shifterUserIdentifier) {
        // For now, do not use user's shift role
        // eslint-disable-next-line no-unused-vars
        const shifter = await getUserOrFail(shifterUserIdentifier);

        const now = Date.now();

        const currentShift = getShiftFromTimestamp(now);
        if (now - currentShift.start > PENDING_SHIFT_MARGIN) {
            return currentShift;
        } else {
            return getShiftFromTimestamp(now - SHIFT_DURATION);
        }
    }

    /**
     * Return all the data for the pending shift of a specific type for a given user
     *
     * @param {UserIdentifier} shifterUserIdentifier the identifier of the user for which shift information must be retrieved
     * @param {String} shiftType the type of the shift for which information must be retrieved
     * @param {Date} shiftStart the start time of the shift (to check for previous information)
     * @return {Promise<object>} the shift data
     */
    async getShiftData(shifterUserIdentifier, shiftType) {
        const shift = await this.getUserPendingShiftOrFail(shifterUserIdentifier);

        const ret = {
            shift,
            issuesLogs: await this.getShiftIssues(shift.start, shiftType),
            typeSpecific: null,
            infoFromPreviousShifter: { value: '' },
        };

        // Find EoS reports from the last shift with the correct title
        const pastShift = getShiftFromTimestamp(shift.start - SHIFT_DURATION);
        const expectedPreviousReportTitle = formatEosReportTitle(pastShift, shiftType);

        const previousShiftReports = await getLogsByTitle(expectedPreviousReportTitle, { rootOnly: true });

        if (previousShiftReports.length === 0) {
            ret.infoFromPreviousShifter.errorMessage = `No ${shiftType} EoS reports found from the previous shift`;
        } else if (previousShiftReports.length > 1) {
            ret.infoFromPreviousShifter.errorMessage = `Multiple ${shiftType} EoS reports found from the previous shift`;
        } else {
            const eosReportText = previousShiftReports[0].text;
            if (!eosReportText) {
                ret.infoFromPreviousShifter.errorMessage = 'EoS report from the previous shift is missing the text field';
            } else {
                const infoFromPreviousShifterRegex = /\n\n### For next shifter\n([\S\s]*?)\n\n###/g;
                const infoFromPreviousShifterAllMatchesIterator = eosReportText.matchAll(infoFromPreviousShifterRegex);
                const infoFromPreviousShifterAllMatches = [...infoFromPreviousShifterAllMatchesIterator];
                if (!infoFromPreviousShifterAllMatches || infoFromPreviousShifterAllMatches.length === 0) {
                    ret.infoFromPreviousShifter.errorMessage = 'EoS report from the previous shift is missing the information transfer field';
                } else {
                    // eslint-disable-next-line no-unused-vars
                    const [[_, infoFromPreviousShifterMatch]] = infoFromPreviousShifterAllMatches;
                    if (infoFromPreviousShifterMatch === '' || infoFromPreviousShifterMatch === '-') {
                        ret.infoFromPreviousShifter.errorMessage = 'Previous EoS report contains no information for next shifter';
                    } else {
                        ret.infoFromPreviousShifter.value = infoFromPreviousShifterMatch;
                    }
                }
            }
        }

        switch (shiftType) {
            case ShiftTypes.ECS:
                ret.typeSpecific = await this._getEcsShiftData(shift);
                break;
            case ShiftTypes.QC_PDP:
                ret.typeSpecific = await this._getQcPdpShiftData(shift);
                break;
            case ShiftTypes.SL:
                ret.typeSpecific = await this._getShiftLeaderShiftData(shift);
                break;
        }
        return ret;
    }

    /**
     * Return the log entries related to a given shift and shifter
     *
     * @param {number} shiftStart the start of the shift (UNIX timestamp in milliseconds)
     * @param {string} shiftType the type of the shift for which information must be retrieved
     * @return {Promise<Log[]>} resolves with the found issues
     */
    async getShiftIssues(shiftStart, shiftType) {
        const shift = getShiftFromTimestamp(shiftStart);

        return (await getShiftIssues(shift, getShiftTagsFiltersByType(shiftType))).map(logAdapter.toEntity);
    }

    /**
     * For a given shift, returns the ECS shift data
     *
     * @param {Shift} shift the shift for which data must be fetched
     * @return {Promise<{environments: Environment[]}>} the ECS shift data
     */
    async _getEcsShiftData(shift) {
        return {
            environments: (await getShiftEnvironments(shift, ShiftTypes.ECS))
                .map((environment) => environmentAdapter.toEntity(environment, false)),
        };
    }

    /**
     * For a given shift, returns the QC/PDP shift data
     *
     * @param {Shift} shift the shift for which data must be fetched
     * @return {Promise<{runs: Object<string, Run[]>}>} the QC/PDP shift data
     * @private
     */
    async _getQcPdpShiftData(shift) {
        const runsByDefinition = {};
        for (const [definition, runs] of Object.entries(await getShiftRuns(shift, ShiftTypes.QC_PDP))) {
            runsByDefinition[definition] = runs.map(runAdapter.toEntity);
        }
        return { runs: runsByDefinition };
    }

    /**
     * For a given shift, returns the Shift Leader shift data
     *
     * @param {Shift} shift the shift for which data must be fetched
     * @return {Promise<{runs: Object<string, Run[]>}>} the Shift Leader shift data
     * @private
     */
    async _getShiftLeaderShiftData(shift) {
        const runsByDefinition = {};
        for (const [definition, runs] of Object.entries(await getShiftRuns(shift, ShiftTypes.SL))) {
            runsByDefinition[definition] = runs.map(runAdapter.toEntity);
        }

        return {
            runs: runsByDefinition,
            tagsCounters: await getShiftIssuesTagsOccurrences(shift),
        };
    }
}

exports.ShiftService = ShiftService;

exports.shiftService = new ShiftService();
