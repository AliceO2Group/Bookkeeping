const { User } = require('../controllers');
module.exports = {
  method: 'get',
  path: '/users',
  controller: User.index,
  args: { public: true },
  children: [
    {
      method: 'get',
      path: '/:id',
      controller: User.read,
    },
    {
      method: 'get',
      path: '/:id/tokens',
      controller: User.getTokens,
    },
    {
      method: 'post',
      path: '/:id/tokens',
      controller: User.postTokens,
    },
    {
      method: 'get',
      path: '/:id/logs',
      controller: User.getLogs,
    },
  ],
};
