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
