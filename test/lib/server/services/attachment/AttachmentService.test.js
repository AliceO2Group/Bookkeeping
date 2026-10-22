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

const { expect } = require('chai');
const { attachmentService } = require('../../../../../lib/server/services/attachment/AttachmentService.js');
const { NotFoundError } = require('../../../../../lib/server/errors/NotFoundError.js');

module.exports = () => {
    it('should successfully get an attachment by its id, without timestamps', async () => {
        const attachment = await attachmentService.getOneOrFail(1);
        expect(attachment.id).to.equal(1);
        expect(attachment).to.have.all.keys('id', 'fileName', 'size', 'mimeType', 'originalName', 'path', 'encoding', 'logId');
    });

    it('should fail to get an attachment that does not exist', async () => {
        let error;
        try {
            await attachmentService.getOneOrFail(999999999);
        } catch (e) {
            error = e;
        }
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal('Attachment with this id (999999999) could not be found');
    });

    it('should successfully create an attachment linked to a log', async () => {
        const attachment = await attachmentService.create({
            size: 12,
            path: '/tmp/attachment-service-test.png',
            filename: 'attachment-service-test.png',
            originalname: 'test.png',
            mimetype: 'image/png',
            encoding: '7bit',
        }, 1);

        expect(attachment).to.deep.include({
            fileName: 'attachment-service-test.png',
            originalName: 'test.png',
            mimeType: 'image/png',
            encoding: '7bit',
            size: 12,
            logId: 1,
        });
        expect(await attachmentService.getOneOrFail(attachment.id)).to.eql(attachment);
    });
};
