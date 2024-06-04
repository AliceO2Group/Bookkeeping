const { getAllTriggerCountersForRunHandler } = require('../controllers/triggerCounters.controller');

exports.triggerCountersRouter = {
    method: 'get',
    path: '/trigger-counters/:runNumber',
    controller: getAllTriggerCountersForRunHandler,
};
