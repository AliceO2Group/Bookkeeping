const MonalisaSuite = require('./monalisa/index.js');
const CcdbSuite = require('./ccdb/index.js');

module.exports = () => {
    describe('MonALISA', MonalisaSuite);
    describe('CCDB', CcdbSuite);
};
