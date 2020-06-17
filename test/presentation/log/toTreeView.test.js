/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3),
 *copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

const {
    log: {
        toTreeView,
    },
} = require('../../../lib/presentation');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    it('should work', () => {
        const root = {
            id: 1,
            authorId: 'John Doe',
            title: 'First entry',
            createdAt: 1591219115000,
            tags: [
                {
                    id: 3,
                    text: 'MAINTENANCE',
                },
            ],
            text: 'Power interruption due to unplugged wire.',
            origin: 'human',
            subtype: 'run',
            rootLogId: 1,
            parentLogId: 1,
        };

        const children = [
            {
                id: 2,
                authorId: 'John Doe',
                title: 'Second entry',
                createdAt: 1591219115000,
                tags: [
                    {
                        id: 2,
                        text: 'RUN',
                    },
                    {
                        id: 5,
                        text: 'TEST',
                    },
                ],
                text: 'Detected particle ABC123',
                origin: 'process',
                subtype: 'subsystem',
                rootLogId: 1,
                parentLogId: 1,
            },
            {
                id: 3,
                authorId: 'John Doe',
                title: 'Third entry',
                createdAt: 1591219115000,
                tags: [
                    {
                        id: 1,
                        text: 'FOOD',
                    },
                    {
                        id: 4,
                        text: 'GLOBAL',
                    },
                    {
                        id: 6,
                        text: 'OTHER',
                    },
                ],
                text: 'Cake at the particle accelerator!',
                origin: 'human',
                subtype: 'announcement',
                rootLogId: 1,
                parentLogId: 1,
            },
            {
                id: 4,
                authorId: 'John Doe',
                title: 'Fourth entry',
                createdAt: 1591219115000,
                tags: [],
                text: 'The cake is a lie!',
                origin: 'human',
                subtype: 'comment',
                rootLogId: 1,
                parentLogId: 2,
            },
            {
                id: 14,
                authorId: 'John Doe',
                title: 'test on third',
                createdAt: 1591446994000,
                tags: [],
                text: 'text',
                origin: 'process',
                subtype: 'run',
                rootLogId: 1,
                parentLogId: 3,
            },
            {
                id: 15,
                authorId: 'John Doe',
                title: 'depth',
                createdAt: 1591450185000,
                tags: [],
                text: '4444',
                origin: 'process',
                subtype: 'run',
                rootLogId: 1,
                parentLogId: 14,
            },
        ];

        expect(toTreeView(root, children)).to.deep.equal({
            id: 1,
            authorId: 'John Doe',
            title: 'First entry',
            createdAt: 1591219115000,
            tags: [
                {
                    id: 3,
                    text: 'MAINTENANCE',
                },
            ],
            text: 'Power interruption due to unplugged wire.',
            origin: 'human',
            subtype: 'run',
            rootLogId: 1,
            parentLogId: 1,
            children: [
                {
                    id: 2,
                    authorId: 'John Doe',
                    title: 'Second entry',
                    createdAt: 1591219115000,
                    tags: [
                        {
                            id: 2,
                            text: 'RUN',
                        },
                        {
                            id: 5,
                            text: 'TEST',
                        },
                    ],
                    text: 'Detected particle ABC123',
                    origin: 'process',
                    subtype: 'subsystem',
                    rootLogId: 1,
                    parentLogId: 1,
                    children: [
                        {
                            id: 4,
                            authorId: 'John Doe',
                            title: 'Fourth entry',
                            createdAt: 1591219115000,
                            tags: [],
                            text: 'The cake is a lie!',
                            origin: 'human',
                            subtype: 'comment',
                            rootLogId: 1,
                            parentLogId: 2,
                            children: [],
                        },
                    ],
                },
                {
                    id: 3,
                    authorId: 'John Doe',
                    title: 'Third entry',
                    createdAt: 1591219115000,
                    tags: [
                        {
                            id: 1,
                            text: 'FOOD',
                        },
                        {
                            id: 4,
                            text: 'GLOBAL',
                        },
                        {
                            id: 6,
                            text: 'OTHER',
                        },
                    ],
                    text: 'Cake at the particle accelerator!',
                    origin: 'human',
                    subtype: 'announcement',
                    rootLogId: 1,
                    parentLogId: 1,
                    children: [
                        {
                            id: 14,
                            authorId: 'John Doe',
                            title: 'test on third',
                            createdAt: 1591446994000,
                            tags: [],
                            text: 'text',
                            origin: 'process',
                            subtype: 'run',
                            rootLogId: 1,
                            parentLogId: 3,
                            children: [
                                {
                                    id: 15,
                                    authorId: 'John Doe',
                                    title: 'depth',
                                    createdAt: 1591450185000,
                                    tags: [],
                                    text: '4444',
                                    origin: 'process',
                                    subtype: 'run',
                                    rootLogId: 1,
                                    parentLogId: 14,
                                    children: [],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });
};
