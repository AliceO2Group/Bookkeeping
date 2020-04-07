const appendPath = require('../../lib/utils/appendPath');
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
