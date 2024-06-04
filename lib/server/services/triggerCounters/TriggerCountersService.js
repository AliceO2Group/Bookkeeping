const { TriggerCountersRepository } = require('../../../database/repositories');
const { triggerCountersAdapter } = require('../../../database/adapters');

/**
 * Service related to trigger counters
 */
class TriggerCountersService {
    /**
     * Return the list of trigger counters linked to a given run
     *
     * @param {number} runNumber the run number of the run for which counters must be fetched
     * @return {Promise<SequelizeTriggerCounters[]>} the trigger counters for the run
     */
    async getPerRun(runNumber) {
        return (await TriggerCountersRepository.findAll({ where: { runNumber } })).map(triggerCountersAdapter.toEntity);
    }
}

exports.TriggerCountersService = TriggerCountersService;

exports.triggerCountersService = new TriggerCountersService();
