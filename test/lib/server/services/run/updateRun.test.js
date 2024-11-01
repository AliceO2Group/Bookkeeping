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

const { getRun } = require('../../../../../lib/server/services/run/getRun.js');
const { updateRun } = require('../../../../../lib/server/services/run/updateRun.js');
const { expect } = require('chai');
const { RunDefinition } = require('../../../../../lib/domain/enums/RunDefinition.js');
const { resetDatabaseContent } = require('../../../../utilities/resetDatabaseContent.js');
const { getLog } = require('../../../../../lib/server/services/log/getLog.js');

module.exports = () => {
    before(resetDatabaseContent);
    let lastLogId = 119;

    it('should successfully update the run definition when updating run', async () => {
        const runNumber = 56;
        const run = await getRun({ runNumber });
        const { timeTrgStart, timeTrgEnd } = run;

        await updateRun({ runNumber }, {
            runPatch: {
                timeTrgStart: new Date('2020-01-01 01:00:00'),
                timeTrgEnd: new Date('2020-01-01 00:00:00'),
            },
        });

        let updatedRun = await getRun({ runNumber });

        expect(updatedRun.definition).to.equal(RunDefinition.COMMISSIONING);

        updatedRun = await updateRun({ runNumber }, { runPatch: { timeTrgStart, timeTrgEnd } });

        expect(updatedRun.definition).to.equal(RunDefinition.PHYSICS);
    });

    it('should successfully create a log when adding a tag that needs to be logged', async () => {
        await updateRun({ runNumber: 1 }, {
            relations: { tags: [{ id: 19, text: 'Not for physics' }] },
        });

        const lastLog = await getLog(++lastLogId, (qb) => {
            qb.include('tags');
        });
        expect(lastLog.title).to.equal('Run 1 tags has changed');
        expect(lastLog.text.startsWith('The following tags has been added to run 1: `Not for physics` on ')).to.be.true;
        expect(lastLog.tags).to.lengthOf(1);
        expect(lastLog.tags[0].text).to.equal('Not for physics');
    });

    it('should successfully NOT create a log when adding a tag that DO NOT need to be logged', async () => {
        await updateRun({ runNumber: 2 }, {
            relations: { tags: [{ id: 1, text: 'FOOD' }] },
        });

        const lastLog = await getLog(lastLogId + 1);
        expect(lastLog).to.be.null;
    });

    it('should successfully create a log when replacing a tag by one that needs logging', async () => {
        await updateRun({ runNumber: 2 }, {
            relations: { tags: [{ id: 19, text: 'Not for physics' }] },
        });

        const lastLog = await getLog(++lastLogId, (qb) => {
            qb.include('tags');
        });

        expect(lastLog.title).to.equal('Run 2 tags has changed');
        expect(lastLog.text.startsWith('Run 2 tags has been changed from `FOOD` to `Not for physics`')).to.be.true;
        expect(lastLog.tags).to.lengthOf(1);
        expect(lastLog.tags[0].text).to.equal('Not for physics');
    });

    it(
        'should successfully NOT create a log when adding a tag that do NOT need logging to a run that already have tags that needs logging',
        async () => {
            await updateRun({ runNumber: 2 }, {
                relations: { tags: [{ id: 19, text: 'Not for physics' }, { id: 1, text: 'FOOD' }] },
            });

            const lastLog = await getLog(lastLogId + 1);
            expect(lastLog).to.be.null;
        },
    );

    it(
        'should successfully NOT create a log when removing a tag that do NOT need logging to a run that already have tags that needs logging',
        async () => {
            await updateRun({ runNumber: 2 }, {
                relations: { tags: [{ id: 19, text: 'Not for physics' }] },
            });

            const lastLog = await getLog(lastLogId + 1);
            expect(lastLog).to.be.null;
        },
    );

    it('should successfully create a log when replacing a tag that needs logging', async () => {
        await updateRun({ runNumber: 2 }, {
            relations: { tags: [{ id: 1, text: 'Food' }] },
        });

        const lastLog = await getLog(++lastLogId, (qb) => {
            qb.include('tags');
        });

        expect(lastLog.title).to.equal('Run 2 tags has changed');
        expect(lastLog.text.startsWith('Run 2 tags has been changed from `Not for physics` to `Food`')).to.be.true;
        expect(lastLog.tags).to.lengthOf(1);
        expect(lastLog.tags[0].text).to.equal('Not for physics');
    });

    it('should successfully create a log when removing a tag that needs to be logged', async () => {
        await updateRun({ runNumber: 1 }, {
            relations: { tags: [] },
        });

        const lastLog = await getLog(++lastLogId, (qb) => {
            qb.include('tags');
        });

        expect(lastLog.title).to.equal('Run 1 tags has changed');
        expect(lastLog.text.startsWith('The following tags has been removed from run 1: `Not for physics`')).to.be.true;
        expect(lastLog.tags).to.lengthOf(1);
        expect(lastLog.tags[0].text).to.equal('Not for physics');
    });

    it('should successfully NOT create a log when removing a tag that DO NOT need to be logged', async () => {
        await updateRun({ runNumber: 2 }, {
            relations: { tags: [] },
        });

        const lastLog = await getLog(lastLogId + 1);
        expect(lastLog).to.be.null;
    });
};
