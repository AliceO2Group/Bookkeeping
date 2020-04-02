const { Tag } = require('../controllers');
module.exports = {
  path: '/tag',
  args: { public: true },
  children: [
    {
      method: 'get',
      path: '',
      controller: Tag.index,
    },
    {
      method: 'post',
      path: '',
      controller: Tag.create,
    },
    {
      method: 'get',
      path: ':id',
      controller: Tag.read,
      children:[
        {
          method: 'get',
          path: '/runs',
          controller: Tag.getRuns,
        },
        {
          method: 'get',
          path: '/logs',
          controller: Tag.getLogs,
        },
        {
          method: 'patch',
          path: '/runs',
          controller: Tag.patchRun,
        },
        {
          method: 'patch',
          path: '/log',
          controller: Tag.patchLog,
        },
        {
          method: 'delete',
          path: '',
          controller: Tag.deleteTag,
        },
      ],
    },

  ],
};