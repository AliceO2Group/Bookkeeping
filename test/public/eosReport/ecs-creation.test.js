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
    reloadPage,
    fillInput,
    expectInnerText,
    waitForNavigation,
    pressElement,
    expectUrlParams,
} = require('../defaults.js');
const { expect } = require('chai');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');
const { getLog } = require('../../../lib/server/services/log/getLog.js');
const { createEnvironment } = require('../../../lib/server/services/environment/createEnvironment.js');
const { customizedECSEosReport, emptyECSEosReportRequest } = require('../../mocks/mock-ecs-eos-report.js');
const { createEnvironmentHistoryItem } = require('../../../lib/server/services/environmentHistoryItem/createEnvironmentHistoryItem.js');
const { createRun } = require('../../../lib/server/services/run/createRun.js');
const { getOrCreateAllDetectorsByName } = require('../../../lib/server/services/detector/getOrCreateAllDetectorsByName.js');
const EorReasonRepository = require('../../../lib/database/repositories/EorReasonRepository.js');
const { ShiftTypes } = require('../../../lib/domain/enums/ShiftTypes.js');
const { eosReportService } = require('../../../lib/server/services/eosReport/EosReportService.js');
const { SHIFT_DURATION } = require('../../../lib/server/services/shift/getShiftFromTimestamp.js');

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

    it('Should successfully display the ECS eos report creation page', async () => {
        const response = await goToPage(page, 'eos-report-create', { queryParameters: { shiftType: ShiftTypes.ECS } });
        expect(response.status()).to.equal(200);
        expectUrlParams(page, { page: 'eos-report-create', shiftType: ShiftTypes.ECS });
    });

    it('Should successfully create an ECS EoS report when submitting the form and redirect to the corresponding log', async () => {
        for (const environment of customizedECSEosReport.typeSpecific.environments) {
            await createEnvironment({
                ...environment,
            });
            await createEnvironmentHistoryItem({
                status: 'DESTROYED',
                createdAt: new Date(),
                updatedAt: new Date(),
                environmentId: environment.id,
            });
            for (const run of environment.runs) {
                const runId = await createRun(
                    run,
                    {
                        detectors: await getOrCreateAllDetectorsByName((run?.concatenatedDetectors ?? '')
                            .split(',')
                            .map((value) => value.trim())),
                    },
                );

                // Create the expected EOR
                const eorReasons = [];
                for (const eorReason of run.eorReasons) {
                    eorReasons.push({ reasonTypeId: eorReason.reasonTypeId, description: eorReason.description, runId });
                }
                if (eorReasons.length > 0) {
                    await EorReasonRepository.addMany(eorReasons);
                }
            }
        }

        // Create the expected previous EoS report
        const past = new Date(Date.now() - SHIFT_DURATION);
        const info = 'Important information for the next tester';
        const request = {
            ...emptyECSEosReportRequest,
            shiftStart: past,
            infoForNextShifter: info,
        };

        await eosReportService.createLogEntry(ShiftTypes.ECS, request, { userId: 1 });
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
        expectInnerText(page, '#from-previous-shifter .CodeMirror textarea', info);
        await page.focus('#from-previous-shifter .CodeMirror textarea');
        await page.keyboard.type('Old information: ');

        await page.waitForSelector('#for-next-shifter .CodeMirror textarea');
        await page.focus('#for-next-shifter .CodeMirror textarea');
        await page.keyboard.type('For next shifter\nOn multiple lines');

        await page.waitForSelector('#for-rm-rc .CodeMirror textarea');
        await page.focus('#for-rm-rc .CodeMirror textarea');
        await page.keyboard.type('For RM & RC\nOn multiple lines');

        await waitForNavigation(page, () => pressElement(page, '#submit'));
        expectUrlParams(page, { page: 'log-detail', id: '121' });

        // Fetch log manually, because it's hard to parse codemirror display
        const { text } = await getLog(121);
        expect(text.includes('- shifter: Shifter name')).to.be.true;
        expect(text.includes('- trainee: Trainee name')).to.be.true;
        expect(text.includes('## Issues during the shift\n')).to.be.true;
        expect(text.includes(`## Environments and runs
- (17/03/2023, 09:13:03) [ENV1](http://localhost:4000?page=env-details&environmentId=ENV1)
    * (17/03/2023, 09:14:03) [200](http://localhost:4000?page=run-detail&runNumber=200) - COMMISSIONING - 01:02:03 - good
        - EOR:
            * DETECTORS - CPV - EOR description
            * DETECTORS - TPC - 2nd EOR description
        - Comment:
          Comment
          on run`)).to.be.true;
        expect(text.includes('## Shift flow\nShift flow\nOn multiple lines')).to.be.true;
        expect(text.includes('## LHC\nLHC machines\ntransitions')).to.be.true;
        expect(text.includes(`### From previous shifter\nOld information: ${info}`)).to.be.true;
        expect(text.includes('### For next shifter\nFor next shifter\nOn multiple lines')).to.be.true;
        expect(text.includes('### For RM/RC\nFor RM & RC\nOn multiple lines')).to.be.true;
    });
};
