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

let getEfficiencyLevel;

module.exports = () => {
    before(async () => {
        ({ getEfficiencyLevel } = await import('../../../../../lib/public/views/LhcFills/format/efficiencyLevel.js'));
    });

    it('should have no level for a missing or null efficiency', () => {
        expect(getEfficiencyLevel(null)).to.be.null;
        expect(getEfficiencyLevel(undefined)).to.be.null;
        expect(getEfficiencyLevel(NaN)).to.be.null;
        expect(getEfficiencyLevel(0)).to.be.null;
    });

    it('should have a great level from 95%', () => {
        expect(getEfficiencyLevel(0.95)).to.equal('great');
        expect(getEfficiencyLevel(0.9999)).to.equal('great');
        expect(getEfficiencyLevel(1)).to.equal('great');
    });

    it('should have a good level from 80% to 95% excluded', () => {
        expect(getEfficiencyLevel(0.8)).to.equal('good');
        expect(getEfficiencyLevel(0.9499)).to.equal('good');
    });

    it('should have a bad level below 80%', () => {
        expect(getEfficiencyLevel(0.7999)).to.equal('bad');
        expect(getEfficiencyLevel(0.4167)).to.equal('bad');
        expect(getEfficiencyLevel(0.0001)).to.equal('bad');
    });
};
