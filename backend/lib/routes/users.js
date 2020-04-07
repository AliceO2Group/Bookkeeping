const { UserController } = require('../controllers');
module.exports = {
    method: 'get',
    path: '/users',
    controller: UserController.index,
    args: { public: true },
    children: [
        {
            method: 'get',
            path: ':id',
            controller: UserController.read,
            children: [
                {
                    method: 'get',
                    path: 'tokens',
                    controller: UserController.getTokens,
                },
                {
                    method: 'post',
                    path: 'tokens',
                    controller: UserController.postTokens,
                },
                {
                    method: 'get',
                    path: 'logs',
                    controller: UserController.getLogs,
                },
            ],
        },
    ],
};
