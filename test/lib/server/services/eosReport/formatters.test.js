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

const { indent, eosReportFormatLog, eosReportFormatEorReason } = require('../../../../../lib/server/services/eosReport/formatters.js');
const { expect } = require('chai');

module.exports = () => {
    it('should successfully indent a given text', async () => {
        expect(indent('text\nto\r\nindent')).to.equal('    text\n    to\r\n    indent');
        expect(indent('text\nto\r\nindent', '    ')).to.equal('    text\n    to\r\n    indent');
        expect(indent('text\n    to\r\n    indent', '    ')).to.equal('    text\n        to\r\n        indent');
        expect(indent('text\n\tto\r\n\tindent', '    ')).to.equal('    text\n    \tto\r\n    \tindent');
        expect(indent('text\n\tto\r\n\tindent', '\t')).to.equal('\ttext\n\t\tto\r\n\t\tindent');
    });

    it('should successfully format a given log', () => {
        expect(eosReportFormatLog({ id: 1, title: 'First log title', tags: [{ text: 'TAG1' }, { text: 'TAG2' }] }))
            .to.equal('\\[TAG1, TAG2\\] - [First log title](http://localhost:4000?page=log-detail&id=1)');

        expect(eosReportFormatLog({ id: 2, title: 'Second log title', tags: [] }))
            .to.equal('\\[**No tags**\\] - [Second log title](http://localhost:4000?page=log-detail&id=2)');
    });

    it('should successfully format a given eor reason', () => {
        expect(eosReportFormatEorReason({
            reasonType: { category: 'Reason type category', title: 'Reason type title' },
            description: 'Description',
        })).to.equal('Reason type category - Reason type title - Description');

        expect(eosReportFormatEorReason({
            reasonType: { category: 'Reason type category' },
            description: 'Description',
        })).to.equal('Reason type category - Description');
    });
};
