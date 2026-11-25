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

const { once } = require('node:events');
const { createServer } = require('node:http');
const { text } = require('node:stream/consumers');
const { expect } = require('chai');
const request = require('supertest');
const { server } = require('../../lib/application');
const { ServicesConfig } = require('../../lib/config');
const { resetDatabaseContent } = require('../utilities/resetDatabaseContent.js');

const PRESENTATION = {
    templateId: 1,
    from: Date.UTC(2026, 10, 16),
    to: Date.UTC(2026, 10, 23),
};
const PDF_BYTES = Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n%%EOF\n', 'latin1');
const GENERATION_FAILED = {
    status: 502,
    title: 'Generation failed',
    detail: 'The generation service could not return a PDF. Try again later.',
};

module.exports = () => {
    let token;
    let generationService;
    let generationServiceUrl;
    let originalUrl;
    let forwardedRequests;
    let generationResponse;

    before(async () => {
        await resetDatabaseContent();
        token = server.http.o2TokenService.generateToken(1, 'jdoe', 'John Doe');
        generationService = createServer(async (incoming, outgoing) => {
            forwardedRequests.push({
                path: incoming.url,
                method: incoming.method,
                authorization: incoming.headers.authorization,
                contentType: incoming.headers['content-type'],
                body: await text(incoming),
            });
            outgoing.writeHead(generationResponse.status, generationResponse.headers);
            outgoing.end(generationResponse.body);
        });
        generationService.listen(0, '127.0.0.1');
        await once(generationService, 'listening');
        generationServiceUrl = `http://127.0.0.1:${generationService.address().port}`;
        originalUrl = ServicesConfig.aliceInsights.url;
    });

    beforeEach(() => {
        forwardedRequests = [];
        generationResponse = {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="weekly-report.pdf"',
            },
            body: PDF_BYTES,
        };
        ServicesConfig.aliceInsights.url = generationServiceUrl;
    });

    after(async () => {
        ServicesConfig.aliceInsights.url = originalUrl;
        await new Promise((resolve, reject) => generationService.close((error) => error ? reject(error) : resolve()));
    });

    const generate = (body) => request(server).post('/api/presentations').query({ token }).send(body);

    it('forwards the chosen period with the authenticated user and returns the PDF', async () => {
        const response = await generate(PRESENTATION).buffer(true).parse((incoming, callback) => {
            const chunks = [];
            incoming.on('data', (chunk) => chunks.push(chunk));
            incoming.on('end', () => callback(null, Buffer.concat(chunks)));
            incoming.on('error', callback);
        });

        expect(response.status).to.equal(200);
        expect(response.headers['content-type']).to.equal('application/pdf');
        expect(response.headers['content-disposition']).to.equal('attachment; filename="weekly-report.pdf"');
        expect(response.headers['cache-control']).to.equal('no-store');
        expect(response.body).to.deep.equal(PDF_BYTES);
        expect(forwardedRequests).to.have.lengthOf(1);
        const [forwarded] = forwardedRequests;
        expect(forwarded).to.include({
            path: '/presentations',
            method: 'POST',
            authorization: `Bearer ${token}`,
        });
        expect(forwarded.contentType).to.match(/^application\/json\b/);
        expect(JSON.parse(forwarded.body)).to.deep.equal({ ...PRESENTATION, templateId: '1', author: 'John Doe' });
    });

    it('requires a user token before contacting generation', async () => {
        const response = await request(server).post('/api/presentations').send(PRESENTATION);
        expect(response.status).to.equal(401);
        expect(forwardedRequests).to.be.empty;
    });

    for (const [problem, changes] of [
        ['an invalid template ID', { templateId: 0 }],
        ['a fractional date', { from: PRESENTATION.from + 0.5 }],
        ['a reversed period', { to: PRESENTATION.from - 1 }],
        ['an author supplied by the browser', { author: 'Custom author' }],
    ]) {
        it(`rejects ${problem} before contacting generation`, async () => {
            const response = await generate({ ...PRESENTATION, ...changes });
            expect(response.status).to.equal(400);
            expect(response.body.errors).to.have.lengthOf.at.least(1);
            expect(forwardedRequests).to.be.empty;
        });
    }

    it('keeps the generator busy response and its retry delay', async () => {
        generationResponse = {
            status: 503,
            headers: { 'Content-Type': 'application/json', 'Retry-After': '10' },
            body: JSON.stringify({ detail: 'A presentation is being made. Try again when it is done.' }),
        };
        const response = await generate(PRESENTATION);
        expect(response.status).to.equal(503);
        expect(response.headers['retry-after']).to.equal('10');
        expect(response.body.errors).to.eql([
            { status: 503, title: 'Generation busy', detail: 'A presentation is being made. Try again when it is done.' },
        ]);
    });

    for (const [status, title, detail] of [
        [401, 'Session expired', 'Bookkeeping rejected your user token. Sign in to Bookkeeping again.'],
        [422, 'Invalid presentation', 'The template has no modules.'],
        [502, 'Data unavailable', 'Bookkeeping could not provide the data for this presentation.'],
    ]) {
        it(`passes on the sentence with which the generator explains a ${status}`, async () => {
            generationResponse = { status, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ detail }) };
            const response = await generate(PRESENTATION);
            expect(response.status).to.equal(status);
            expect(response.body.errors).to.eql([{ status, title, detail }]);
        });
    }

    for (const [answer, body] of [
        ['without a sentence', JSON.stringify({ errors: ['Not a sentence of the generator'] })],
        ['that is not JSON', 'Not a sentence of the generator'],
    ]) {
        it(`explains an error in its own words for an answer ${answer}`, async () => {
            generationResponse = { status: 422, headers: { 'Content-Type': 'application/json' }, body };
            const response = await generate(PRESENTATION);
            expect(response.status).to.equal(422);
            expect(response.body.errors).to.eql([
                { status: 422, title: 'Invalid presentation', detail: 'Check the selected template and period and try again.' },
            ]);
        });
    }

    it('reports a non-PDF response as a generation service failure', async () => {
        generationResponse = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ detail: 'A JSON response instead of a PDF' }),
        };
        const response = await generate(PRESENTATION);
        expect(response.status).to.equal(502);
        expect(response.headers['content-disposition']).to.be.undefined;
    });

    it('reports a PDF response that holds no PDF as a generation service failure', async () => {
        generationResponse = {
            status: 200,
            headers: { 'Content-Type': 'application/pdf' },
            body: '<html>Not a PDF</html>',
        };
        const response = await generate(PRESENTATION);
        expect(response.status).to.equal(502);
        expect(response.headers['content-disposition']).to.be.undefined;
        expect(response.body.errors).to.eql([GENERATION_FAILED]);
    });

    it('reports an answer with a status the generator does not use as a generation service failure', async () => {
        generationResponse = {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ detail: 'Internal Server Error' }),
        };
        const response = await generate(PRESENTATION);
        expect(response.status).to.equal(502);
        expect(response.body.errors).to.eql([GENERATION_FAILED]);
    });
};
