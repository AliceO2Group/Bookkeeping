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
const { getAllDetectors } = require('../../../../../lib/server/services/detector/getAllDetectors.js');
const { DetectorType } = require('../../../../../lib/domain/enums/DetectorTypes.js');

module.exports = () => {
    it('should successfully return the full list of detectors', async () => {
        const detectors = await getAllDetectors();
        expect(detectors.map(({ id, name, type }) => ({ id, name, type }))).to.deep.eq([
            {
                id: 1,
                name: 'CPV',
                type: DetectorType.PHYSICAL,
            },
            {
                id: 2,
                name: 'EMC',
                type: DetectorType.PHYSICAL,
            },
            {
                id: 3,
                name: 'FDD',
                type: DetectorType.PHYSICAL,
            },
            {
                id: 4,
                name: 'ITS',
                type: DetectorType.PHYSICAL,
            },
            {
                id: 5,
                name: 'FV0',
                type: DetectorType.PHYSICAL,
            },
            {
                id: 6,
                name: 'HMP',
                type: DetectorType.PHYSICAL,
            },
            {
                id: 7,
                name: 'FT0',
                type: DetectorType.PHYSICAL,
            },
            {
                id: 8,
                name: 'MCH',
                type: DetectorType.PHYSICAL,
            },
            {
                id: 9,
                name: 'MFT',
                type: DetectorType.PHYSICAL,
            },
            {
                id: 10,
                name: 'MID',
                type: DetectorType.PHYSICAL,
            },
            {
                id: 11,
                name: 'PHS',
                type: DetectorType.PHYSICAL,
            },
            {
                id: 12,
                name: 'TOF',
                type: DetectorType.PHYSICAL,
            },
            {
                id: 13,
                name: 'TPC',
                type: DetectorType.PHYSICAL,
            },
            {
                id: 14,
                name: 'TRD',
                type: DetectorType.PHYSICAL,
            },
            {
                id: 15,
                name: 'TST',
                type: DetectorType.VIRTUAL,
            },
            {
                id: 16,
                name: 'ZDC',
                type: DetectorType.PHYSICAL,
            },
            {
                id: 17,
                name: 'ACO',
                type: DetectorType.PHYSICAL,
            },
            {
                id: 18,
                name: 'CTP',
                type: DetectorType.PHYSICAL,
            },
            {
                id: 19,
                name: 'FIT',
                type: DetectorType.PHYSICAL,
            },
            {
                id: 20,
                name: 'QC-SPECIFIC',
                type: DetectorType.QC,
            },
            {
                id: 21,
                name: 'GLO',
                type: DetectorType.QC,
            },
        ]);
    });
};
