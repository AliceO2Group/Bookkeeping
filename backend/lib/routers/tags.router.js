/**
 * This file is part of the ALICE Electronic Logbook v2, also known as Jiskefet.
 * Copyright (C) 2020  Stichting Hogeschool van Amsterdam
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const { TagsController } = require('../controllers');

module.exports = {
    path: '/tags',
    args: { public: true },
    children: [
        {
            method: 'get',
            path: '',
            controller: TagsController.index,
        },
        {
            method: 'post',
            path: '',
            controller: TagsController.create,
        },
        {
            method: 'get',
            path: ':id',
            controller: TagsController.read,
            children:[
                {
                    method: 'get',
                    path: '/runs',
                    controller: TagsController.getRuns,
                },
                {
                    method: 'get',
                    path: '/logs',
                    controller: TagsController.getLogs,
                },
                {
                    method: 'get',
                    path: '/runs',
                    controller: TagsController.patchRun,
                },
                {
                    method: 'get',
                    path: '/log',
                    controller: TagsController.patchLog,
                },
                {
                    method: 'delete',
                    path: '',
                    controller: TagsController.deleteTag,
                },
            ],
        },
    ],
};
