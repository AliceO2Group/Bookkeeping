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

const { expect } = require('chai');
const { qcFlagTypesService } = require('../../../../../lib/server/services/qualityControlFlag/QCFlagTypesService');
const assert = require('assert');
const { NotFoundError } = require('../../../../../lib/server/errors/NotFoundError');

module.exports = () => {
    describe('Fetching quality control flags types', () => {
        it ('should successfuly fetch QC Flag Type by id', async () => {
            const qcFlagType = await qcFlagTypesService.getByIdentifier({ id: 2 });
            delete qcFlagType.createdAt;
            delete qcFlagType.updatedAt;
            expect(qcFlagType).to.be.eql({
                id: 2,
                name: 'UnknownQuality',
                method: 'Unknown Quality',
                bad: true,
                color: null,

                archived: false,
                archivedAt: null,

                createdById: 1,
                createdBy: { id: 1, externalId: 1, name: 'John Doe' },
                lastUpdatedById: null,
                lastUpdatedBy: null,
            });
        });

        it ('should return null when there is no QC Flag type with given id ', async () => {
            const qcFlagType = await qcFlagTypesService.getByIdentifier({ id: 9999 });
            expect(qcFlagType).to.be.eql(null);
        });

        it ('should successfuly fetch QC Flag Type by name', async () => {
            const qcFlagType = await qcFlagTypesService.getByIdentifier({ name: 'CertifiedByExpert' });
            delete qcFlagType.createdAt;
            delete qcFlagType.updatedAt;
            expect(qcFlagType).to.be.eql({
                id: 3,
                name: 'CertifiedByExpert',
                method: 'Certified by Expert',
                bad: false,
                color: null,

                archived: false,
                archivedAt: null,

                createdById: 1,
                createdBy: { id: 1, externalId: 1, name: 'John Doe' },
                lastUpdatedById: null,
                lastUpdatedBy: null,
            });
        });

        it ('should reject when no QC Flag type with given id was found', async () => {
            await assert.rejects(
                () => qcFlagTypesService.getOneOrFail({ id: 99999 }),
                new NotFoundError('Quality Control Flag Type with this id (99999) could not be found'),
            );
        });
    });
};
