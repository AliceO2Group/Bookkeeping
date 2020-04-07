const { ApiController } = require('../controllers');
module.exports = {
    method: 'get',
    path: '/',
    controller: ApiController,
    args: { public: true },
};
