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
    repositories: {
        FlpRepository,
    },
    utilities: {
        TransactionHelper,
        QueryBuilder,
    },
} = require('../../database');

const {
    adapters: {
        FlpAdapter,
    },
} = require('../../domain');

/**
 * UpdateFlpUseCase
 */
class UpdateFlpUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The UpdateFlpUseCase containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { body, params } = dto;
        const { flpId } = params;
        const { nTimeframes, bytesProcessed, bytesEquipmentReadOut, bytesRecordingReadOut, bytesFairMQReadOut } = body;

        return await TransactionHelper.provide(async () => {
            body.userId = dto.session.id || null;

            const queryBuilder = new QueryBuilder().where('id').is(flpId);

            const flpEntity = await FlpRepository.findOne(queryBuilder);

            if (flpEntity) {
                flpEntity.nTimeframes = nTimeframes;
                flpEntity.bytesProcessed = bytesProcessed;
                flpEntity.bytesEquipmentReadOut = bytesEquipmentReadOut;
                flpEntity.bytesRecordingReadOut = bytesRecordingReadOut;
                flpEntity.bytesFairMQReadOut = bytesFairMQReadOut;

                await flpEntity.save();
            } else {
                return {
                    error: {
                        status: '400',
                        title: `flp with id (${flpId}) could not be found`,
                    },
                };
            }

            return FlpAdapter.toEntity(flpEntity);
        });
    }
}

module.exports = UpdateFlpUseCase;
