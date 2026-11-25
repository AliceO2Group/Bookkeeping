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
const sinon = require('sinon');
const { ServicesConfig } = require('../../../../../lib/config');
const { generatePresentation } = require('../../../../../lib/server/services/presentation/generatePresentation.js');

const SELECTION = { templateId: 1, from: 0, to: 1000 };

module.exports = () => {
    let sandbox;
    let fetchStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.replace(ServicesConfig.aliceInsights, 'url', null);
        fetchStub = sandbox.stub(globalThis, 'fetch');
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('reports when generation has not been configured', async () => {
        const result = await generatePresentation(SELECTION, 'John Doe', 'test-token');
        expect(result).to.deep.equal({
            status: 503,
            title: 'Generation unavailable',
            detail: 'Presentation generation is not configured for this Bookkeeping server.',
        });
        expect(fetchStub.called).to.be.false;
    });

    it('reports when the generator takes too long', async () => {
        ServicesConfig.aliceInsights.url = 'http://127.0.0.1';
        fetchStub.rejects(new DOMException('Request timed out', 'TimeoutError'));

        const result = await generatePresentation(SELECTION, 'John Doe', 'test-token');
        expect(result).to.deep.equal({
            status: 504,
            title: 'Generation timed out',
            detail: 'The generation service took too long to finish. Try again later.',
        });
    });

    it('reports when the generator cannot be reached', async () => {
        ServicesConfig.aliceInsights.url = 'http://127.0.0.1';
        fetchStub.rejects(new TypeError('fetch failed', { cause: { code: 'ECONNREFUSED' } }));

        const result = await generatePresentation(SELECTION, 'John Doe', 'test-token');
        expect(result).to.deep.equal({
            status: 502,
            title: 'Generation failed',
            detail: 'The generation service could not return a PDF. Try again later.',
        });
    });
};
