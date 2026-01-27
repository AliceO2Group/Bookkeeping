const { getAllCtpTriggerCountersForRunHandler } = require('../controllers/ctpTriggerCounters.controller');

exports.ctpTriggerCountersRouter = {
    method: 'get',
    path: '/ctp-trigger-counters/:runNumber',
    controller: getAllCtpTriggerCountersForRunHandler,
};
