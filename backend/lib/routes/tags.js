const { TagController } = require('../controllers');
module.exports = {
    path: '/tag',
    args: { public: true },
    children: [
        {
            method: 'get',
            path: '',
            controller: TagController.index,
        },
        {
            method: 'post',
            path: '',
            controller: TagController.create,
        },
        {
            method: 'get',
            path: ':id',
            controller: TagController.read,
            children:[
                {
                    method: 'get',
                    path: '/runs',
                    controller: TagController.getRuns,
                },
                {
                    method: 'get',
                    path: '/logs',
                    controller: TagController.getLogs,
                },
                {
                    method: 'get',
                    path: '/runs',
                    controller: TagController.patchRun,
                },
                {
                    method: 'get',
                    path: '/log',
                    controller: TagController.patchLog,
                },
                {
                    method: 'delete',
                    path: '',
                    controller: TagController.deleteTag,
                },
            ],
        },

    ],
};
