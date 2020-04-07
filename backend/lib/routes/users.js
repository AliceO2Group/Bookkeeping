const { User } = require('../controllers');
module.exports = {
    method: 'get',
    path: '/users',
    controller: User.index,
    args: { public: true },
    children: [
        {
            method: 'get',
            path: ':id',
            controller: User.read,
            children: [
                {
                    method: 'get',
                    path: 'tokens',
                    controller: User.getTokens,
                },
                {
                    method: 'post',
                    path: 'tokens',
                    controller: User.postTokens,
                },
                {
                    method: 'get',
                    path: 'logs',
                    controller: User.getLogs,
                },
            ],
        },
    ],
};
