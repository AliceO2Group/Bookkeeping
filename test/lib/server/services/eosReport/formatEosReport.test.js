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

const { formatEosReport } = require('../../../../../lib/server/services/eosReport/formatEosReport.js');
const { expect } = require('chai');
const {
    customizedECSEosReport,
    formattedCustomizedECSEosReport,
    emptyECSEosReport,
    formattedEmptyECSEosReport,
} = require('../../../../mocks/mock-ecs-eos-report.js');

module.exports = () => {
    it('should successfully format ECS EoS report with provided data', async () => {
        const report = await formatEosReport(customizedECSEosReport);

        expect(report).to.equal(formattedCustomizedECSEosReport);
    });

    it('should successfully format an ECS EoS report with missing optional data', async () => {
        const report = await formatEosReport(emptyECSEosReport);

        expect(report).to.equal(formattedEmptyECSEosReport);
    });
};
