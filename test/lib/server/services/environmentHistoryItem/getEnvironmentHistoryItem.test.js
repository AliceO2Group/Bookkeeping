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

const { getEnvironmentHistoryItem } = require('../../../../../lib/server/services/environmentHistoryItem/getEnvironmentHistoryItem.js');
const { expect } = require('chai');

module.exports = () => {
    it('should successfully returns the environment\'s history item corresponding to the given id', async () => {
        const environmentHistoryItem = await getEnvironmentHistoryItem(1);
        expect(environmentHistoryItem.status).to.equal('DEPLOYED');
        expect(environmentHistoryItem.statusMessage).to.equal('Environment has been deployed');
        expect(environmentHistoryItem.environmentId).to.equal('CmCvjNbg');
    });

    it('should return null when trying to fetch a non-existing environment\'s history item', async () => {
        expect(await getEnvironmentHistoryItem(999)).to.be.null;
    });
};
