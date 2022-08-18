/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

const {
    adapters: {
        RunTypeAdapter,
    },
} = require('../../domain');

const {
    repositories: {
        RunTypeRepository,
    },
    utilities: {
        TransactionHelper,
        QueryBuilder,
    },
} = require('../../database');

const GetRunTypeUseCase = require('./GetRunTypeUseCase');

/**
 * CreatRunTypeUseCase
 */
class CreateRunTypeUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The createRunTypeDto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { body } = dto;
        const { name } = body;
        console.log('hello world')
        const runType = await TransactionHelper.provide(async () => {
            const queryBuilder = new QueryBuilder();
            queryBuilder.where('name').is(name);
            const fetchedType = await RunTypeRepository.findOne(queryBuilder);
            if (fetchedType) {
                return { error: {
                    status: '409',
                    source: { pointer: '/data/attributes/body/name' },
                    title: 'Conflict',
                    detail: 'The provided name already exists',
                } };
            }
            console.log('this still works')
            return RunTypeRepository.insert(RunTypeAdapter.toDatabase(body));
        });
        console.log('hello 2')
        if (runType.error) {
            return runType;
        }
        const result = await new GetRunTypeUseCase().execute({ params: { runTypeId: runType.id } });
        return { result } ;
    }
}

module.exports = CreateRunTypeUseCase;
