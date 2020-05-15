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

const { appendPath } = require('../../../lib/server/utilities');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    it('should handle no slashes', () => {
        const base = 'base';
        const appendix = 'appendix';
        expect(appendPath(base, appendix)).to.equal('/base/appendix');
    });

    it('should handle a slash only at the base', () => {
        const base = 'base/';
        const appendix = 'appendix';
        expect(appendPath(base, appendix)).to.equal('/base/appendix');
    });

    it('should handle a slash only at the appendix', () => {
        const base = 'base';
        const appendix = '/appendix';
        expect(appendPath(base, appendix)).to.equal('/base/appendix');
    });

    it('should handle slashes at both the base and appendix', () => {
        const base = 'base/';
        const appendix = '/appendix';
        expect(appendPath(base, appendix)).to.equal('/base/appendix');
    });

    it('should remove unneeded slashes', () => {
        const base = '//base///';
        const appendix = '////appendix///';
        expect(appendPath(base, appendix)).to.equal('/base/appendix');
    });
};
