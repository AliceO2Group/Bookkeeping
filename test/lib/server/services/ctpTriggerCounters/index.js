const { resetDatabaseContent } = require('../../../../utilities/resetDatabaseContent');
const CtpTriggerCountersServiceTest = require('./CtpTriggerCountersService.test');

module.exports = () => {
    before(resetDatabaseContent);

    describe('CtpTriggerCountersService', CtpTriggerCountersServiceTest);
};
