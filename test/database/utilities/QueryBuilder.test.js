/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

const {
    repositories: {
        LogRepository,
    },
    utilities: {
        QueryBuilder,
    },
} = require('../../../lib/database');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    describe('WhereQueryBuilder', () => {
        describe('not', () => {
            it('should return a single entity which does not have the provided id', async () => {
                const queryBuilder = new QueryBuilder();
                queryBuilder.where('id').not().is('1');

                const result = await LogRepository.findOne(queryBuilder);
                expect(result).to.not.be.null;
                expect(result.id).to.equal(2);
            });

            it('should return entities not with the id in the provided range', async () => {
                const queryBuilder = new QueryBuilder();
                queryBuilder.where('id').not().between(1, 3);

                const result = await LogRepository.findAll(queryBuilder);
                expect(result).to.not.be.null;
                expect(result).to.have.lengthOf(116);
                expect(result[0].id).to.equal(4);
                expect(result[1].id).to.equal(5);
            });

            it('should return a single entity with the provided id', async () => {
                const queryBuilder = new QueryBuilder();
                queryBuilder.where('id').not().oneOf('1', 2);
                queryBuilder.orderBy('id', 'asc');

                const result = await LogRepository.findOne(queryBuilder);
                expect(result).to.not.be.null;
                expect(result.id).to.equal(3);
            });

            it('should return a single entity with the provided id', async () => {
                const queryBuilder = new QueryBuilder();
                queryBuilder.where('id').not().allOf('1', 2);
                queryBuilder.orderBy('id', 'asc');

                const result = await LogRepository.findOne(queryBuilder);
                expect(result).to.not.be.null;
                expect(result.id).to.equal(3);
            });
        });

        describe('between', () => {
            it('should return entities with the id in the provided range', async () => {
                const queryBuilder = new QueryBuilder();
                queryBuilder.where('id').between(1, '3');

                const result = await LogRepository.findAll(queryBuilder);
                expect(result).to.not.be.null;
                expect(result).to.have.lengthOf(3);
                expect(result[0].id).to.equal(1);
                expect(result[1].id).to.equal(2);
                expect(result[2].id).to.equal(3);
            });
        });

        describe('is', () => {
            it('should return a single entity with the provided id', async () => {
                const queryBuilder = new QueryBuilder();
                queryBuilder.where('id').is('1');

                const result = await LogRepository.findAll(queryBuilder);
                expect(result).to.not.be.null;
                expect(result).to.have.lengthOf(1);
                expect(result[0].id).to.equal(1);
            });
        });

        describe('isOrNull', () => {
            it('should return all entities with parent_log_id 1 or null', async () => {
                const queryBuilder = new QueryBuilder();
                queryBuilder.where('parent_log_id').isOrNull('1');

                const result = await LogRepository.findAll(queryBuilder);
                expect(result).to.not.be.null;
                expect(result).to.have.lengthOf(118);
                expect(result[0].parentLogId).to.equal(null); // From seeders file
                expect(result[1].parentLogId).to.equal(1);
            });
        });

        describe('allOf', () => {
            it('should return no entities', async () => {
                const queryBuilder = new QueryBuilder();
                queryBuilder.where('id').allOf(1, 2);

                const result = await LogRepository.findAll(queryBuilder);
                expect(result).to.not.be.null;
                expect(result).to.have.lengthOf(0);
            });
        });

        describe('oneOf', () => {
            it('should return entities with the provided id', async () => {
                const queryBuilder = new QueryBuilder();
                queryBuilder.where('id').oneOf('1', 2);
                queryBuilder.orderBy('id', 'asc');

                const result = await LogRepository.findAll(queryBuilder);
                expect(result).to.not.be.null;
                expect(result).to.have.lengthOf(2);
                expect(result[0].id).to.equal(1);
                expect(result[1].id).to.equal(2);
            });
        });

        describe('startsWith', () => {
            it('should return only entities starting with "First"', async () => {
                const queryBuilder = new QueryBuilder();
                queryBuilder.where('title').startsWith('First');
                queryBuilder.orderBy('id', 'asc');

                const result = await LogRepository.findAll(queryBuilder);
                expect(result).to.not.be.null;
                result.forEach(({ title }) => {
                    expect(title.startsWith('First')).to.be.true;
                });
            });

            it('should return only entities not starting with "First"', async () => {
                const queryBuilder = new QueryBuilder();
                queryBuilder.where('title').not().startsWith('First');
                queryBuilder.orderBy('id', 'asc');

                const result = await LogRepository.findAll(queryBuilder);
                expect(result).to.not.be.null;
                result.forEach(({ title }) => {
                    expect(title.startsWith('First')).to.be.false;
                });
            });
        });

        describe('endsWith', () => {
            it('should return only entities ending with "entry"', async () => {
                const queryBuilder = new QueryBuilder();
                queryBuilder.where('title').endsWith('entry');
                queryBuilder.orderBy('id', 'asc');

                const result = await LogRepository.findAll(queryBuilder);
                expect(result).to.not.be.null;
                result.forEach(({ title }) => {
                    expect(title.endsWith('entry')).to.be.true;
                });
            });

            it('should return only entities not ending with "entry"', async () => {
                const queryBuilder = new QueryBuilder();
                queryBuilder.where('title').not().endsWith('entry');
                queryBuilder.orderBy('id', 'asc');

                const result = await LogRepository.findAll(queryBuilder);
                expect(result).to.not.be.null;
                result.forEach(({ title }) => {
                    expect(title.endsWith('entry')).to.be.false;
                });
            });
        });

        describe('substring', () => {
            it('should return only entities containing "entr"', async () => {
                const queryBuilder = new QueryBuilder();
                queryBuilder.where('title').substring('entr');
                queryBuilder.orderBy('id', 'asc');

                const result = await LogRepository.findAll(queryBuilder);
                expect(result).to.not.be.null;
                result.forEach(({ title }) => {
                    expect(title.includes('entr')).to.be.true;
                });
            });

            it('should return only entities not containing "og"', async () => {
                const queryBuilder = new QueryBuilder();
                queryBuilder.where('title').not().substring('entr');
                queryBuilder.orderBy('id', 'asc');

                const result = await LogRepository.findAll(queryBuilder);
                expect(result).to.not.be.null;
                result.forEach(({ title }) => {
                    expect(title.includes('entr')).to.be.false;
                });
            });
        });
    });
};
