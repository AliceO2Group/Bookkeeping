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

const { runTypeService } = require('../../../../../lib/server/services/runType/RunTypeService.js');
const { NotFoundError } = require('../../../../../lib/server/errors/NotFoundError.js');
const { expect } = require('chai');

module.exports = () => {
    it('should successfully return all the run types sorted by name (descending) with only their id and name', async () => {
        const runTypes = await runTypeService.getAll();

        expect(runTypes.length).to.be.greaterThan(2);
        runTypes.forEach((runType) => expect(Object.keys(runType)).to.have.members(['id', 'name']));
        const names = runTypes.map(({ name }) => name);
        expect(names).to.eql([...names].sort().reverse());
    });

    it('should successfully return a run type by id', async () => {
        expect(await runTypeService.getOneOrFail({ id: 1 })).to.eql({ id: 1, name: 'NONE' });
    });

    it('should successfully return a run type by name', async () => {
        expect(await runTypeService.getOneOrFail({ name: 'NONE' })).to.eql({ id: 1, name: 'NONE' });
    });

    it('should fail with a not found error when the run type does not exist', async () => {
        const error = await runTypeService.getOneOrFail({ id: 999999 }).catch((error) => error);
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal('Run type with this id (999999) could not be found');
    });
};
