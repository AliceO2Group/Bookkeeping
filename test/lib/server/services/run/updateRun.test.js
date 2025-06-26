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
const { qcFlagService } = require('../../../../../lib/server/services/qualityControlFlag/QcFlagService.js');
const QcFlagEffectivePeriodRepository = require('../../../../../lib/database/repositories/QcFlagEffectivePeriodRepository.js');

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

    describe('QC flag timestamps update trigger', () => {
        const runNumber = 56; // QC time start = 2019-08-08 20:00:00, end = 2019-08-08 21:00:00
        const detectorId = 7; // FT0
        const dataPassId = 4; // LHC22a_apass2
        const flagTypeId = 3; // Good
        const relations = { user: { roles: ['admin'], externalUserId: 456 } };

        it('should successfully leave QC flag timestamps equal null when updating run', async () => {
            const [{ id }] = await qcFlagService.create(
                [{ from: null, to: null, flagTypeId }],
                { runNumber, detectorIdentifier: { detectorId }, dataPassIdentifier: { id: dataPassId } },
                relations,
            );

            await updateRun(
                { runNumber },
                { runPatch: { timeTrgStart: new Date('2019-08-08 20:01:00'), timeTrgEnd: new Date('2019-08-08 20:59:00') } },
            );
            const flag = await qcFlagService.getById(id);
            expect(flag.from).to.be.null;
            expect(flag.to).to.be.null;
        });

        it('should successfully change QC flag timestamps to null when updating run', async () => {
            const [{ id }] = await qcFlagService.create(
                [{ from: new Date('2019-08-08 20:02:00'),
                    to: new Date('2019-08-08 20:58:00'),
                    flagTypeId }],
                { runNumber, detectorIdentifier: { detectorId }, dataPassIdentifier: { id: dataPassId } },
                relations,
            );

            await updateRun(
                { runNumber },
                { runPatch: { timeTrgStart: new Date('2019-08-08 20:03:00'), timeTrgEnd: new Date('2019-08-08 20:57:00') } },
            );
            const flag = await qcFlagService.getById(id);
            expect(flag.from).to.be.null;
            expect(flag.to).to.be.null;

            const effectivePeriods = await QcFlagEffectivePeriodRepository.findAll({ where: { flagId: id } });
            expect(effectivePeriods).to.be.lengthOf(1);
            expect(effectivePeriods[0].from).to.be.null;
            expect(effectivePeriods[0].to).to.be.null;
        });

        it('should successfully mark a flag as deleted when it is out of updated run boundaries', async () => {
            const [{ id }] = await qcFlagService.create(
                [{ from: new Date('2019-08-08 20:05:00'),
                    to: new Date('2019-08-08 20:07:00'),
                    flagTypeId }],
                { runNumber, detectorIdentifier: { detectorId }, dataPassIdentifier: { id: dataPassId } },
                relations,
            );

            await updateRun({ runNumber }, { runPatch: { timeTrgStart: new Date('2019-08-08 20:10:00') } });
            const flag = await qcFlagService.getById(id);
            expect(flag.from).to.be.null;
            expect(flag.to).to.equal(new Date('2019-08-08 20:07:00').getTime());
            expect(flag.deleted).to.be.true;

            const effectivePeriods = await QcFlagEffectivePeriodRepository.findAll({ where: { flagId: id } });
            expect(effectivePeriods).to.be.lengthOf(0);
        });
    });
};
