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
    adapters: {
        TagAdapter,
    },
} = require('../../domain');
const {
    repositories: {
        TagRepository,
    },
    utilities: {
        QueryBuilder,
        TransactionHelper,
    },
} = require('../../database');


//TODO: place somewhere
const filterObjectFields = (obj, args) => {
    // First check is needed for `fields[TYPE]=` to still return values
    if ((args.length == 1 && args[0] === '') || args.length == 0) return obj;

    return ({
        ...args.reduce((res, key) => ({ ...res, [key]: obj[key] }), {})
    })
}

/**
 * GetTagUseCase
 */
class GetTagUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The GetTagDto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { params, query } = dto;
        const { tagId } = params;
        const { fields } = query;

        let tag = await TransactionHelper.provide(async () => {
            const queryBuilder = new QueryBuilder()
                .where('id').is(tagId);

            return TagRepository.findOne(queryBuilder);
        });

        if (fields !== null) {
            tag = filterObjectFields(tag, fields.tag.split(','));
        }

        return tag ? tag : null;
    }
}

module.exports = GetTagUseCase;
