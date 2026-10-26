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

let getBeamTypeFamily;

module.exports = () => {
    before(async () => {
        ({ getBeamTypeFamily } = await import('../../../../../lib/public/views/LhcFills/format/beamTypeFamily.js'));
    });

    it('should recognize the lead-lead collisions', () => {
        expect(getBeamTypeFamily('PB82 - PB82')).to.equal('lead-lead');
        expect(getBeamTypeFamily('Pb-Pb')).to.equal('lead-lead');
    });

    it('should recognize the proton-proton collisions', () => {
        expect(getBeamTypeFamily('PROTON - PROTON')).to.equal('proton-proton');
        expect(getBeamTypeFamily('p-p')).to.equal('proton-proton');
    });

    it('should recognize the proton-ion collisions', () => {
        expect(getBeamTypeFamily('PROTON - O8')).to.equal('proton-ion');
        expect(getBeamTypeFamily('p-Pb')).to.equal('proton-ion');
    });

    it('should recognize the other ion-ion collisions', () => {
        expect(getBeamTypeFamily('O8 - O8')).to.equal('ion-ion');
        expect(getBeamTypeFamily('NE10 - NE10')).to.equal('ion-ion');
    });

    it('should not recognize malformed beam types', () => {
        expect(getBeamTypeFamily(null)).to.equal('unknown');
        expect(getBeamTypeFamily('')).to.equal('unknown');
        expect(getBeamTypeFamily('PROTON')).to.equal('unknown');
        expect(getBeamTypeFamily('PROTON - ')).to.equal('unknown');
    });
};
