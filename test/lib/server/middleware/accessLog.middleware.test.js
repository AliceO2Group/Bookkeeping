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

const { EventEmitter } = require('events');
const sinon = require('sinon');
const { expect } = require('chai');
const { accessLogMiddleware } = require('../../../../lib/server/middleware/accessLog.middleware.js');

/**
 * Run a request through the access log middleware
 *
 * @param {object} request the request fields
 * @param {object} [responseFields] the response fields
 * @param {object} [configuration] the middleware configuration
 * @return {{logger: object, next: Function, response: object}} the objects used to run the middleware
 */
const handle = (request, responseFields = {}, configuration = {}) => {
    const logger = { infoMessage: sinon.fake() };
    const next = sinon.fake();
    const response = Object.assign(new EventEmitter(), {
        statusCode: 200,
        writableFinished: true,
        getHeader: (name) => responseFields.headers?.[name],
    }, responseFields);

    accessLogMiddleware({ logger, silent: false, ...configuration })(request, response, next);
    return { logger, next, response };
};

module.exports = () => {
    it('should log a single line JSON entry with route pattern, status, duration, user, size and params once the response is sent', () => {
        const query = { filter: { runNumbers: '1,2' }, page: { limit: '10' } };
        const { logger, next, response } = handle(
            {
                method: 'GET',
                baseUrl: '/api',
                originalUrl: '/api/runs/12?a=1',
                route: { path: '/runs/:runNumber' },
                session: { id: 7 },
                query,
                headers: { 'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1' },
            },
            { headers: { 'content-length': '123' }, statusCode: 201 },
        );

        expect(next.calledOnce).to.be.true;
        expect(logger.infoMessage.called).to.be.false;

        response.emit('finish');
        response.emit('close');

        expect(logger.infoMessage.calledOnce).to.be.true;
        const [message] = logger.infoMessage.firstCall.args;
        expect(message).to.not.include('\n');

        const { durationMs, ...entry } = JSON.parse(message);
        expect(durationMs).to.be.a('number').and.to.be.at.least(0);
        expect(entry).to.eql({
            type: 'api_request',
            protocol: 'http',
            method: 'GET',
            route: '/api/runs/:runNumber',
            status: 201,
            userId: 7,
            bytes: 123,
            client: 'browser',
            device: 'phone',
            params: JSON.stringify(query),
        });
    });

    it('should identify the client from the user agent and the mobile hint', () => {
        const { logger, response } = handle({
            method: 'GET',
            baseUrl: '/api',
            originalUrl: '/api/runs',
            route: { path: '/runs' },
            headers: { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0 Safari/537.36', 'sec-ch-ua-mobile': '?1' },
        });
        response.emit('finish');
        expect(JSON.parse(logger.infoMessage.firstCall.args[0])).to.include({ client: 'browser', device: 'phone' });

        const { logger: curlLogger, response: curlResponse } = handle({
            method: 'GET',
            baseUrl: '/api',
            originalUrl: '/api/runs',
            route: { path: '/runs' },
            headers: { 'user-agent': 'curl/8.4.0' },
        });
        curlResponse.emit('finish');
        expect(JSON.parse(curlLogger.infoMessage.firstCall.args[0])).to.include({ client: 'curl', device: null });
    });

    it('should log null user and size, no params, and the path when the request is anonymous and no route matched', () => {
        const { logger, response } = handle({ method: 'GET', baseUrl: '/api', originalUrl: '/api/unknown?x=1', query: {} });
        response.emit('finish');

        const entry = JSON.parse(logger.infoMessage.firstCall.args[0]);
        expect(entry).to.include({ route: '/api/unknown', userId: null, bytes: null, client: 'unknown', device: null });
        expect(entry).to.not.have.property('params');
        expect(entry).to.not.have.property('aborted');
    });

    it('should never log the token query parameter', () => {
        const { logger, response } = handle({
            method: 'GET',
            baseUrl: '/api',
            originalUrl: '/api/runs?token=secret&page[limit]=5',
            route: { path: '/runs' },
            query: { token: 'secret', page: { limit: '5' } },
        });
        response.emit('finish');

        const [message] = logger.infoMessage.firstCall.args;
        expect(message).to.not.include('secret');
        expect(JSON.parse(message).params).to.equal(JSON.stringify({ page: { limit: '5' } }));
    });

    it('should not log a query containing only the token parameter', () => {
        const { logger, response } = handle({
            method: 'GET',
            baseUrl: '/api',
            originalUrl: '/api/runs?token=secret',
            route: { path: '/runs' },
            query: { token: 'secret' },
        });
        response.emit('finish');

        expect(JSON.parse(logger.infoMessage.firstCall.args[0])).to.not.have.property('params');
    });

    it('should flag as aborted a request whose connection is closed before the response is sent', () => {
        const { logger, response } = handle({ method: 'GET', baseUrl: '/api', originalUrl: '/api/runs', route: { path: '/runs' } }, { writableFinished: false });
        response.emit('close');

        expect(JSON.parse(logger.infoMessage.firstCall.args[0])).to.include({ aborted: true });
    });

    it('should not log anything when silent', () => {
        const { logger, next, response } = handle({ method: 'GET', baseUrl: '/api', originalUrl: '/api/runs' }, {}, { silent: true });
        response.emit('finish');

        expect(next.calledOnce).to.be.true;
        expect(logger.infoMessage.called).to.be.false;
    });
};
