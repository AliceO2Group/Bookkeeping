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
const {
    customizedQcPdpEosReport,
    formattedCustomizedQcPdpEosReport,
    emptyQcPdpEosReport,
    formattedEmptyQcPdpEosReport,
} = require('../../../../mocks/mock-qc-pdp-eos-report.js');
const {
    customizedSlimosEosReport,
    emptySlimosEosReport,
    formattedEmptySlimosEosReport,
    formattedCustomizedSlimosEosReport,
} = require('../../../../mocks/mock-slimos-eos-report.js');
const {
    customizedShiftLeaderEosReport,
    formattedCustomizedShiftLeaderEosReport,
    emptyShiftLeaderEosReport,
    formattedEmptyShiftLeaderEosReport,
} = require('../../../../mocks/mock-shift-leader-eos-report.js');

module.exports = () => {
    it('should successfully format ECS EoS report with provided data', async () => {
        const report = await formatEosReport(customizedECSEosReport);

        expect(report).to.equal(formattedCustomizedECSEosReport);
    });

    it('should successfully format an ECS EoS report with missing optional data', async () => {
        const report = await formatEosReport(emptyECSEosReport);

        expect(report).to.equal(formattedEmptyECSEosReport);
    });

    it('should successfully format QC/PDP EoS report with provided data', async () => {
        const report = await formatEosReport(customizedQcPdpEosReport);

        expect(report).to.equal(formattedCustomizedQcPdpEosReport);
    });

    it('should successfully format an QC/PDP EoS report with missing optional data', async () => {
        const report = await formatEosReport(emptyQcPdpEosReport);

        expect(report).to.equal(formattedEmptyQcPdpEosReport);
    });

    it('should successfully format SLIMOS EoS report with provided data', async () => {
        const report = await formatEosReport(customizedSlimosEosReport);

        expect(report).to.equal(formattedCustomizedSlimosEosReport);
    });

    it('should successfully format a SLIMOS EoS report with missing optional data', async () => {
        const report = await formatEosReport(emptySlimosEosReport);

        expect(report).to.equal(formattedEmptySlimosEosReport);
    });

    it('should successfully format Shift Leader EoS report with provided data', async () => {
        const report = await formatEosReport(customizedShiftLeaderEosReport);

        expect(report).to.equal(formattedCustomizedShiftLeaderEosReport);
    });

    it('should successfully format a Shift Leader EoS report with missing optional data', async () => {
        const report = await formatEosReport(emptyShiftLeaderEosReport);

        expect(report).to.equal(formattedEmptyShiftLeaderEosReport);
    });
};
