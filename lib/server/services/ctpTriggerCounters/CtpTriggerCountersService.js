const { CtpTriggerCountersRepository } = require('../../../database/repositories');
const { ctpTriggerCountersAdapter } = require('../../../database/adapters');
const { getRunOrFail } = require('../run/getRunOrFail.js');

/**
 * Service related to trigger counters
 */
class CtpTriggerCountersService {
    /**
     * Return the list of trigger counters linked to a given run
     *
     * @param {number} runNumber the run number of the run for which counters must be fetched
     * @return {Promise<CtpTriggerCounters[]>} the trigger counters for the run
     */
    async getPerRun(runNumber) {
        return (await CtpTriggerCountersRepository.findAll({ where: { runNumber } })).map(ctpTriggerCountersAdapter.toEntity);
    }

    /**
     * Create or update trigger counters for a given run
     *
     * @param {object} criteria the criteria identifying the counters to update
     * @param {number} criteria.runNumber the run number of run for which trigger counters are created/updated
     * @param {string} criteria.className the run number of run for which trigger counters are created/updated
     * @param {Pick<CtpTriggerCounters, 'timestamp'|'lmb'|'lma'|'l0b'|'l0a'|'l1b'|'l1a'>} counters the actual counters data
     * @return {Promise<void>} resolves once the counters have been created
     */
    async createOrUpdatePerRun({ runNumber, className }, counters) {
        // Check that run exists
        const run = await getRunOrFail({ runNumber });
        await CtpTriggerCountersRepository.upsert({
            runNumber: run.runNumber,
            className,
            timestamp: counters.timestamp,
            lmb: counters.lmb,
            lma: counters.lma,
            l0b: counters.l0b,
            l0a: counters.l0a,
            l1b: counters.l1b,
            l1a: counters.l1a,
        });
    }
}

exports.CtpTriggerCountersService = CtpTriggerCountersService;

exports.ctpTriggerCountersService = new CtpTriggerCountersService();
