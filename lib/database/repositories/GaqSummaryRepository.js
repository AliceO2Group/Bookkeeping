/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

const {
    models: {
        GaqSummary,
    },
} = require('..');
const Repository = require('./Repository');

/**
 * GaqSummary repository
 */
class GaqSummaryRepository extends Repository {
    /**
     * Creates a new `GaqSummaryRepository` instance.
     */
    constructor() {
        super(GaqSummary);
    }

    /**
     * Mark the summary for a given (dataPassId, runNumber) as invalidated, creating the row if it does not yet exist
     *
     * @param {number} dataPassId data pass id
     * @param {number} runNumber run number
     * @return {Promise<void>} resolves once the summary is invalidated
     */
    async invalidate(dataPassId, runNumber) {
        await this.upsert({ dataPassId, runNumber, invalidatedAt: new Date() });
    }

    /**
     * Mark a list of summaries as invalidated in parallel
     *
     * @param {{ dataPassId: number, runNumber: number }[]} pairs the (dataPassId, runNumber) pairs to invalidate
     * @return {Promise<void>} resolves once all summaries are invalidated
     */
    async invalidateMany(pairs) {
        const invalidatedAt = new Date();
        await Promise.all(pairs.map(({ dataPassId, runNumber }) => this.upsert({ dataPassId, runNumber, invalidatedAt })));
    }
}

module.exports = new GaqSummaryRepository();
