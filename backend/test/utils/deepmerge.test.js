const deepmerge = require('../../lib/utils/deepmerge');
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
                moreLetters:{
                    x: 42,
                    y: 'Not a Number',
                    z: 123,
                },
            };

            expect(deepmerge(source, overwrite)).to.deep.include(expectedResult);
        });
    });
};
