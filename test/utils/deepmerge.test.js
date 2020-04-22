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

const { deepmerge } = require('../../lib/framework/http/utils');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    describe('deepmerge', () => {
        it('should merge two objects recursively', () => {
            const source = {
                a: 1,
                b: 2,
                moreLetters: {
                    x: 42,
                    y: null,
                },
            };
            const overwrite = {
                c: 4,
                moreLetters: {
                    y: 'Not a Number',
                    z: 123,
                },
            };

            const expectedResult = {
                a: 1,
                b: 2,
                c: 4,
                moreLetters: {
                    x: 42,
                    y: 'Not a Number',
                    z: 123,
                },
            };

            expect(deepmerge(source, overwrite)).to.deep.include(expectedResult);
        });
    });
};
