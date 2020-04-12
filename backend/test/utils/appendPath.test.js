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

const { appendPath } = require('../../lib/utils');
const chai = require('chai');
const { expect } = chai;

module.exports = () => {
    describe('appendPath appends', () => {
        it('should normally append when appendix starts with "\\"', () => {
            const base = '/api';
            const appendix = '/endpoint';
            expect(appendPath(base, appendix)).to.equal('/api/endpoint');
        });

        it('should correct missing backslashes', () => {
            const base = '/api';
            const appendixNoBackslash = 'endpoint';
            expect(appendPath(base, appendixNoBackslash)).to.equal('/api/endpoint');
        });
    });

    describe('appendPath corrects', () => {
        it('should not correct missing backslashes if options has appendRule "no-slash"', () => {
            const base = '/api/end';
            const appendix = 'point';
            const appendOptions = {
                appendRule: 'no-slash',
            };
            expect(appendPath(base, appendix, appendOptions)).to.equal('/api/endpoint');
        });
    });
};
