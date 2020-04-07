const appendPath = require('./appendPath.test');
const deepmerge = require('./deepmerge.test');

module.exports = () => {
    describe('appendPath', appendPath);
    describe('deepmerge', deepmerge);
};
