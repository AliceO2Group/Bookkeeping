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
const { status: { GetGuiStatusUseCase } } = require('../../../../lib/usecases/index.js');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    it('should give current gui data', async () => {
        const request = {
            hostname: 'test',
            socket: {
                localPort: 4000,
            },
        };
        const data = await new GetGuiStatusUseCase()
            .execute(request);
        expect(data.status.ok).to.equal(true);
        expect(data.status.configured).to.equal(true);
        expect(data.host).to.equal(request.hostname);
        expect(data.port).to.equal(request.socket.localPort);
    });
};
