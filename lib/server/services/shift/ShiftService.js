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
     * @param {string} shiftType the type of the shift for which information must be retrieved
     * @return {Promise<object>} the shift data
     */
    async getShiftData(shifterUserIdentifier, shiftType) {
        const shift = await this.getUserPendingShiftOrFail(shifterUserIdentifier);

        const ret = {
            shift,
            issuesLogs: await this.getShiftIssues(shift.start, shiftType),
            typeSpecific: null,
        };

        switch (shiftType) {
            case ShiftTypes.ECS:
                ret.typeSpecific = await this._getEcsShiftData(shift);
                break;
            case ShiftTypes.QC_PDP:
                ret.typeSpecific = await this._getQcPdpShiftData(shift);
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
}

exports.ShiftService = ShiftService;

exports.shiftService = new ShiftService();
