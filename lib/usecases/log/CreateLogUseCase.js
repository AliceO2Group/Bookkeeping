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

const { logService } = require('../../server/services/log/LogService.js');

/**
 * CreateLogUseCase
 */
class CreateLogUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The CreateLogDto containing all data.
     * @returns {Promise<{result: (Object|undefined|null), error: (Object|undefined)}>} Promise object represents the result of this use case.
     *      If a transaction is provided, result may be null
     */
    async execute(dto) {
        const { body, files } = dto;
        const { tags: tagsTexts, runNumbers: serializedRunNumbers, lhcFills: serializedLhcFills } = body;
        // Parse comma-separated string to array of numbers
        const runNumbers = serializedRunNumbers ? [
            ...new Set(serializedRunNumbers.split(',')
                .map((x) => x.trim())
                .map((x) => parseInt(x, 10))),
        ] : [];

        const lhcFills = serializedLhcFills ? [
            ...new Set(serializedLhcFills.split(',')
                .map((x) => x.trim())
                .map((x) => parseInt(x, 10))),
        ] : [];

        body.userId = dto?.session?.id || null;

        try {
            return { result: await logService.create(body, runNumbers, tagsTexts || [], lhcFills || [], files || []) };
        } catch (e) {
            return {
                error: {
                    status: '400',
                    title: e.message,
                },
            };
        }
    }
}

module.exports = CreateLogUseCase;
