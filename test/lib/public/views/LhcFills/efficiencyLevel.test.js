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
let EFFICIENCY_SCALE;

module.exports = () => {
    before(async () => {
        ({ getEfficiencyLevel, EFFICIENCY_SCALE } = await import('../../../../../lib/public/views/LhcFills/format/efficiencyLevel.js'));
    });

    it('should have a scale sorted from the best level to the worst one, ending at 0', () => {
        const minimums = EFFICIENCY_SCALE.map(({ minimum }) => minimum);
        expect(minimums).to.deep.equal([...minimums].sort((a, b) => b - a));
        expect(minimums[minimums.length - 1]).to.equal(0);
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

    it('should have a fair level from 70% to 80% excluded', () => {
        expect(getEfficiencyLevel(0.7)).to.equal('fair');
        expect(getEfficiencyLevel(0.76)).to.equal('fair');
        expect(getEfficiencyLevel(0.7999)).to.equal('fair');
    });

    it('should have a poor level from 50% to 70% excluded', () => {
        expect(getEfficiencyLevel(0.5)).to.equal('poor');
        expect(getEfficiencyLevel(0.6999)).to.equal('poor');
    });

    it('should have a bad level below 50%', () => {
        expect(getEfficiencyLevel(0.4999)).to.equal('bad');
        expect(getEfficiencyLevel(0.4167)).to.equal('bad');
        expect(getEfficiencyLevel(0.0001)).to.equal('bad');
    });
};
