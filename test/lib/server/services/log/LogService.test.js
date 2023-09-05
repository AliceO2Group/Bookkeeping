/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

const assert = require('assert');
const { logService } = require('../../../../../lib/server/services/log/LogService.js');
const { NotFoundError } = require('../../../../../lib/server/errors/NotFoundError.js');

module.exports = () => {
    let logMock;

    beforeEach(async () => {
        logMock = {
            title: 'Yet another log',
            text: 'This is the text field of yet another log.',
            tags: [],
        };
    });

    it('Should throw when creating a log with a non-existing parent', async () => {
        await assert.rejects(
            () => logService.create({ ...logMock, parentLogId: 9999 }),
            new NotFoundError('Parent log with this id (9999) could not be found'),
        );
    });
};
