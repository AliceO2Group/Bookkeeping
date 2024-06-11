const { resetDatabaseContent } = require('../../../../utilities/resetDatabaseContent');
const TriggerCountersServiceTest = require('./TriggerCountersService.test');

module.exports = () => {
    before(resetDatabaseContent);

    describe('TriggerCountersService', TriggerCountersServiceTest);
};
