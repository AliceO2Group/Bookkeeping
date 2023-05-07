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

const {
    goToPage,
    defaultBefore,
    defaultAfter,
    checkMismatchingUrlParam,
    waitForNetworkIdleAndRedraw,
    reloadPage, fillInput,
} = require('../defaults.js');
const { expect } = require('chai');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');
const { getLog } = require('../../../lib/server/services/log/getLog.js');
const { createRun } = require('../../../lib/server/services/run/createRun.js');
const EorReasonRepository = require('../../../lib/database/repositories/EorReasonRepository.js');
const { ShiftTypes } = require('../../../lib/domain/enums/ShiftTypes.js');
const { customizedQcPdpEosReport } = require('../../mocks/mock-qc-pdp-eos-report.js');
const { updateRunDetector } = require('../../../lib/server/services/runDetector/updateRunDetector.js');

module.exports = () => {
    let page;
    let browser;

    before(async () => {
        [page, browser] = await defaultBefore(page, browser);
        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
        });
        await resetDatabaseContent();
    });

    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('Should successfully display the QC/PDP eos report creation page', async () => {
        const response = await goToPage(page, 'eos-report-create', { queryParameters: { shiftType: ShiftTypes.QC_PDP } });
        expect(response.status()).to.equal(200);
        expect(await checkMismatchingUrlParam(page, { page: 'eos-report-create', shiftType: encodeURIComponent(ShiftTypes.QC_PDP) })).to.eql({});
    });

    it('Should successfully create a QC/PDP EoS report when submitting the form and redirect to the corresponding log', async () => {
        for (const runs of Object.values(customizedQcPdpEosReport.typeSpecific.runs)) {
            for (const run of runs) {
                const runId = await createRun(
                    {
                        ...run,
                        timeTrgStart: new Date(),
                        timeTrgEnd: new Date(),
                    },
                    run.detectors,
                );
                for (const detector of run.detectors) {
                    await updateRunDetector(
                        run.runNumber,
                        detector.RunDetectors.detectorId,
                        { quality: detector.RunDetectors.quality },
                    );
                }

                // Create the expected EOR
                const eorReasons = [];
                for (const eorReason of run.eorReasons ?? []) {
                    eorReasons.push({ reasonTypeId: eorReason.reasonTypeId, description: eorReason.description, runId });
                }
                if (eorReasons.length > 0) {
                    await EorReasonRepository.addMany(eorReasons);
                }
            }
        }

        await reloadPage(page);

        await page.waitForSelector('#shifter-name input');
        expect(await page.$eval('#shifter-name input', (input) => input.value)).to.equal('Anonymous');
        await page.focus('#shifter-name input');
        await fillInput(page, '#shifter-name input', 'Shifter name');

        await page.waitForSelector('#trainee-name input');
        await page.focus('#trainee-name input');
        await page.keyboard.type('Trainee name');

        await page.waitForSelector('#lhc-transitions .CodeMirror textarea');
        await page.focus('#lhc-transitions .CodeMirror textarea');
        await page.keyboard.type('LHC machines\ntransitions');

        await page.waitForSelector('#type-specific div:nth-child(2) ul li textarea');
        await page.focus('#type-specific div:nth-child(2) ul li textarea');
        await page.keyboard.type('Comment\non run');

        await page.waitForSelector('#shift-flow .CodeMirror textarea');
        await page.focus('#shift-flow .CodeMirror textarea');
        await page.keyboard.type('Shift flow\nOn multiple lines');

        await page.waitForSelector('#from-previous-shifter .CodeMirror textarea');
        await page.focus('#from-previous-shifter .CodeMirror textarea');
        await page.keyboard.type('From previous shifter\nOn multiple lines');

        await page.waitForSelector('#for-next-shifter .CodeMirror textarea');
        await page.focus('#for-next-shifter .CodeMirror textarea');
        await page.keyboard.type('For next shifter\nOn multiple lines');

        await page.waitForSelector('#for-rm-rc .CodeMirror textarea');
        await page.focus('#for-rm-rc .CodeMirror textarea');
        await page.keyboard.type('For RM & RC\nOn multiple lines');

        await page.waitForSelector('#submit');
        await page.click('#submit');

        await waitForNetworkIdleAndRedraw(page);
        expect(await checkMismatchingUrlParam(page, { page: 'log-detail', id: '120' })).to.eql({});

        // Fetch log manually, because it's hard to parse codemirror display
        const { text } = await getLog(120);
        expect(text.includes('- shifter: Shifter name')).to.be.true;
        expect(text.includes('- trainee: Trainee name')).to.be.true;
        expect(text.includes('## Issues during the shift\n')).to.be.true;
        expect(text.includes(`## Runs

### COMMISSIONING
- [200](http://localhost:4000?page=run-detail&id=108) - 00:00:00 - good
    * Detectors: -
    * Detectors QC bad: -
    * EOR:
        * DETECTORS - CPV - EOR description
        * DETECTORS - TPC - 2nd EOR description
    * Comment:
      Comment
      on run

### TECHNICAL
- [201](http://localhost:4000?page=run-detail&id=109) - 00:00:00 - good
    * Detectors: \`ITS\`, \`TST\`
    * Detectors QC bad: \`TST\`
- [202](http://localhost:4000?page=run-detail&id=110) - 00:00:00 - bad
    * Detectors: \`FT0\`, \`TST\`
    * Detectors QC bad: \`FT0\`, \`TST\``)).to.be.true;
        expect(text.includes('## Shift flow\nShift flow\nOn multiple lines')).to.be.true;
        expect(text.includes('## LHC\nLHC machines\ntransitions')).to.be.true;
        expect(text.includes('### From previous shifter\nFrom previous shifter\nOn multiple lines')).to.be.true;
        expect(text.includes('### For next shifter\nFor next shifter\nOn multiple lines')).to.be.true;
        expect(text.includes('### For RM/RC\nFor RM & RC\nOn multiple lines')).to.be.true;
    });
};
