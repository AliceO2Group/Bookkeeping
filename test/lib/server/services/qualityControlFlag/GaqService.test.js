const { resetDatabaseContent } = require('../../../../utilities/resetDatabaseContent.js');
const { runService } = require('../../../../../lib/server/services/run/RunService.js');
const { gaqDetectorService } = require('../../../../../lib/server/services/gaq/GaqDetectorsService.js');
const { qcFlagService } = require('../../../../../lib/server/services/qualityControlFlag/QcFlagService.js');
const { gaqService } = require('../../../../../lib/server/services/qualityControlFlag/GaqService.js');
const { expect } = require('chai');
const { repositories: { RunRepository } } = require('../../../../../lib/database');

module.exports = () => {
    /**
     * Get unix timestamp for given time on 2024-07-10
     * Used to avoid code below to be padded out
     *
     * @param {string} timeString time string in hh:mm:ss format
     * @return {number} unix timestamp
     */
    const t = (timeString) => new Date(`2024-07-10 ${timeString}`).getTime();

    const relations = { user: { roles: ['admin'], externalUserId: 456 } };
    const goodFlagTypeId = 3;
    const badPidFlagTypeId = 12;
    const monteCarloReproductibleFlagTypeId = 5;

    const dataPassId = 3;
    const runNumber = 334455;
    const detectorIds = [1, 2, 3];

    const timeTrgStart = t('06:00:00');
    const timeTrgEnd = t('22:00:00');

    let cpvFlagIds;
    let emcFlagIds;
    let fddFlagIds;

    before(async () => {
        await resetDatabaseContent();

        await runService.create({ runNumber, timeTrgStart, timeTrgEnd });

        const run = await RunRepository.findOne({ where: { runNumber } });
        await run.addDataPass(dataPassId);
        await run.addDetectors(detectorIds);
        await gaqDetectorService.setGaqDetectors(dataPassId, [runNumber], detectorIds);

        // Creating flags fo CPV, EMC, FDD
        const scope = {
            runNumber,
            dataPassIdentifier: { id: dataPassId },
        };
        const scopeCPV = { ...scope, detectorIdentifier: { detectorId: 1 } };
        const scopeEMC = { ...scope, detectorIdentifier: { detectorId: 2 } };
        const scopeFDD = { ...scope, detectorIdentifier: { detectorId: 3 } };

        /*
         * -- 06 -- 08 -- 10 -- 12 -- 14 -- 16 -- 18 -- 20 -- 22 -->
         * ---[XXXXXXXXXXXXXXXXXXXXXXXX      ]--------------------- GOOD
         * ---[            XXXXXXXXXXXX]---------------------------  BAD
         * ---------------[            ]---------------------------  MCR
         * ---------------------------------------[            ]--- GOOD
         */
        cpvFlagIds = (await qcFlagService.create([
            { from: t('06:00:00'), to: t('16:00:00'), flagTypeId: goodFlagTypeId },
            { from: t('06:00:00'), to: t('14:00:00'), flagTypeId: badPidFlagTypeId },
            { from: t('10:00:00'), to: t('14:00:00'), flagTypeId: monteCarloReproductibleFlagTypeId },
            { from: t('18:00:00'), to: t('22:00:00'), flagTypeId: goodFlagTypeId },
        ], scopeCPV, relations)).map(({ id }) => id);

        /*
         * -- 06 -- 08 -- 10 -- 12 13 14 -- 16 -- 18 -- 20 -- 22 -->
         * ---[            ]--------------------------------------- GOOD
         * ---------------[      ]---------------------------------  BAD
         * ---------------------[   ]------------------------------  MCR
         * ---------------------------[      ]--------------------- GOOD
         * ---------------------------------------[      ]--------- GOOD
         */
        emcFlagIds = (await qcFlagService.create([
            { from: t('06:00:00'), to: t('10:00:00'), flagTypeId: goodFlagTypeId },
            { from: t('10:00:00'), to: t('12:00:00'), flagTypeId: badPidFlagTypeId },
            { from: t('12:00:00'), to: t('13:00:00'), flagTypeId: monteCarloReproductibleFlagTypeId },
            { from: t('14:00:00'), to: t('16:00:00'), flagTypeId: goodFlagTypeId },
            { from: t('18:00:00'), to: t('20:00:00'), flagTypeId: goodFlagTypeId },
        ], scopeEMC, relations)).map(({ id }) => id);

        /*
         * -- 06 -- 08 -- 10 -- 12 -- 14 -- 16 -- 18 -- 20 -- 22 -->
         * ---------------[XXXXXXXXXXXX      ]---------------------  BAD
         * ---------------[            ]--------------------------- GOOD
         */
        fddFlagIds = (await qcFlagService.create([
            { from: t('10:00:00'), to: t('16:00:00'), flagTypeId: badPidFlagTypeId },
            { from: t('10:00:00'), to: t('14:00:00'), flagTypeId: goodFlagTypeId },
        ], scopeFDD, relations)).map(({ id }) => id);

        /*
         * Resulting GAQ periods:
         *
         * -- 06 -- 08 -- 10 -- 12 -- 14 -- 16 -- 18 -- 20 -- 22 -->
         *     [           |     |  |  |     |     |     |     ]
         *      BBBBBBBBBBB BBBBB MM MM BBBBB       GGGGG GGGGG
         *
         * > Bad  8h over 16 => 50.0%
         * > MCR  2h over 16 => 12.5%
         * > GOOD 4h over 16 => 25.0%
         */
    });

    it('should successfully get GAQ flags', async () => {
        const gaqFlags = await gaqService.getFlagsForDataPassAndRun(dataPassId, runNumber);
        const data = gaqFlags.map(({
            from,
            to,
            contributingFlags,
        }) => ({
            from,
            to,
            contributingFlagIds: contributingFlags.map(({ id }) => id).sort((id1, id2) => id1 - id2),
        }));

        expect(data).to.have.all.deep.ordered.members([
            { from: t('06:00:00'), to: t('10:00:00'), contributingFlagIds: [cpvFlagIds[1], emcFlagIds[0]] },
            { from: t('10:00:00'), to: t('12:00:00'), contributingFlagIds: [cpvFlagIds[2], emcFlagIds[1], fddFlagIds[1]] },
            { from: t('12:00:00'), to: t('13:00:00'), contributingFlagIds: [cpvFlagIds[2], emcFlagIds[2], fddFlagIds[1]] },
            { from: t('13:00:00'), to: t('14:00:00'), contributingFlagIds: [cpvFlagIds[2], fddFlagIds[1]] },
            { from: t('14:00:00'), to: t('16:00:00'), contributingFlagIds: [cpvFlagIds[0], emcFlagIds[3], fddFlagIds[0]] },
            { from: t('18:00:00'), to: t('20:00:00'), contributingFlagIds: [cpvFlagIds[3], emcFlagIds[4]] },
            { from: t('20:00:00'), to: t('22:00:00'), contributingFlagIds: [cpvFlagIds[3]] },
        ]);
        expect(gaqFlags.every(({ contributingFlags }) => contributingFlags
            .every(({ flagType, createdBy, verifications }) => flagType && createdBy && verifications))).to.be.true;
    });

    it('should successfully get GAQ summary', async () => {
        const gaqSummary = await gaqService.getSummary(dataPassId);
        const runGaqSummary = gaqSummary.get(runNumber);
        expect(runGaqSummary).to.be.eql({
            badCoverage: .5,
            mcReproducibleCoverage: .125,
            goodCoverage: .25,
            totalCoverage: .875,
        });
    });

    it('should successfully get GAQ summary with null bounds', async () => {
        const scope = {
            runNumber: 56,
            dataPassIdentifier: { id: dataPassId },
        };

        const ft0Id = 7;
        const itsId = 4;

        await qcFlagService.create(
            [{ from: null, to: null, flagTypeId: goodFlagTypeId }],
            { ...scope, detectorIdentifier: { detectorId: ft0Id } },
            relations,
        );
        await qcFlagService.create(
            [{ from: null, to: null, flagTypeId: goodFlagTypeId }],
            { ...scope, detectorIdentifier: { detectorId: itsId } },
            relations,
        );

        scope.runNumber = 54;
        await qcFlagService.create(
            [{ from: null, to: null, flagTypeId: badPidFlagTypeId }],
            { ...scope, detectorIdentifier: { detectorId: itsId } },
            relations,
        );

        const gaqSummary = await gaqService.getSummary(dataPassId);
        expect(gaqSummary).to.be.eql({
            [runNumber]: expectedGaqSummary,
            56: {
                missingVerificationsCount: 2,
                explicitlyNotBadEffectiveRunCoverage: 1,
                badEffectiveRunCoverage: 0,
                mcReproducible: false,
            },
            54: {
                missingVerificationsCount: 1,
                explicitlyNotBadEffectiveRunCoverage: 0,
                badEffectiveRunCoverage: 1,
                mcReproducible: false,
            },
        });
    });
};
