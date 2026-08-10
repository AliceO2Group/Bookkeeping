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

const { expect } = require('chai');
const { filterOutLegacyDetectorsForNewerPeriods } = require('../../../../lib/public/utilities/filterOutLegacyDetectorsForNewerPeriods.js');

module.exports = () => {
    it('should filter legacy detectors for newer periods', () => {
        const detectors = [{ name: 'CPV' }, { name: 'PHS' }, { name: 'ITS' }];

        expect(filterOutLegacyDetectorsForNewerPeriods(detectors, 'LHC25ab')).to.deep.equal([{ name: 'ITS' }]);
        expect(filterOutLegacyDetectorsForNewerPeriods(detectors, 'LHC26ad_cpass1_residuals')).to.deep.equal([{ name: 'ITS' }]);
        expect(filterOutLegacyDetectorsForNewerPeriods(detectors, 'LHC24')).to.deep.equal(detectors);
        expect(filterOutLegacyDetectorsForNewerPeriods(detectors, '')).to.deep.equal(detectors);
    });
};
