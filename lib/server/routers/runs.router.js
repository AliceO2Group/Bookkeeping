const { RunsController } = require('../controllers');

module.exports = {
    children: [
        {
            path: '/runs',
            children: [
                {
                    method: 'get',
                    path: 'reasonTypes',
                    controller: RunsController.listReasonTypes,
                },
                {
                    method: 'get',
                    controller: RunsController.listRuns,
                },
                {
                    method: 'get',
                    path: 'aliceMagnetsCurrentLevels',
                    controller: RunsController.listAllAliceL3AndDipoleLevelsForPhysicsRuns,
                },
                {
                    path: ':runNumber',
                    children: [
                        {
                            method: 'get',
                            controller: (req, res) => {
                                const runNumbers = req.params.runNumber.split(',');
                                if (runNumbers.length > 1) {
                                    return RunsController.getRunsByListIds(req, res, runNumbers);
                                } else {
                                    return RunsController.getRunByIdentifierHandler(req, res);
                                }
                            },
                        },
                        {
                            method: 'put',
                            controller: RunsController.updateRun,
                        },
                        {
                            method: 'get',
                            path: 'logs',
                            controller: RunsController.getLogsByRunNumberHandler,
                        },
                        {
                            method: 'get',
                            path: 'flps',
                            controller: RunsController.getFlpsByRunNumberHandler,
                        },
                        {
                            method: 'patch',
                            controller: RunsController.endRun,
                        },
                    ],
                },
                {
                    method: 'post',
                    controller: RunsController.startRun,
                },
                {
                    method: 'patch',
                    controller: RunsController.updateRunByRunNumber,
                },
            ],
        }, {
            path: '/legacy/runs',
            children: [
                {
                    path: ':runId',
                    children: [
                        {
                            method: 'get',
                            controller: RunsController.getRunByIdentifierHandler,
                        },
                    ],
                },
            ],
        },
    ],
};
