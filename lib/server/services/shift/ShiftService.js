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
const { logAdapter } = require('../../../database/adapters/index.js');
const { getShiftIssues } = require('../eosReport/getShiftIssues.js');

// Time after the end of the shift during which one the user is allowed to fill the EOS report
const PENDING_SHIFT_MARGIN = 2 * 3600 * 1000;

/**
 * Service to generate end of shift report
 */
class ShiftService {
    /**
     * Constructor
     */
    constructor() {
        this._issuesLogEntriesTags = ['DCS', 'ECS', 'QC/PDP', 'SL', 'SLIMOS'];
    }

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
     * Return the log entries related to a given shift and shifter
     *
     * @param {number} shiftStart the start of the shift (UNIX timestamp in milliseconds)
     * @param {UserIdentifier} shifterUserIdentifier the identifier of the shifter
     * @return {Promise<Log[]>} resolves with the found issues
     */
    async getShiftIssues(shiftStart, shifterUserIdentifier) {
        const shift = getShiftFromTimestamp(shiftStart);
        const shifter = await getUserOrFail(shifterUserIdentifier);

        return (await getShiftIssues(shift, shifter, this._issuesLogEntriesTags)).map(logAdapter.toEntity);
    }

    /**
     * Returns the tags to use to shift's issues logs
     *
     * @return {string[]} the tags to use
     */
    get issuesLogEntriesTags() {
        return this._issuesLogEntriesTags;
    }

    /**
     * Defines the tags to use to fetch EOS report's issues logs
     *
     * @param {string[]} tagTexts the tags to use
     */
    set issuesLogEntriesTags(tagTexts) {
        this._issuesLogEntriesTags = tagTexts;
    }
}

exports.ShiftService = ShiftService;

exports.shiftService = new ShiftService();
