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

const sinon = require('sinon');
const { expect } = require('chai');
const { ApiRequestLogger, MAX_PARAMS_LENGTH } = require('../../../../lib/server/utilities/ApiRequestLogger.js');

module.exports = () => {
    const request = { protocol: 'grpc', route: '/o2.bookkeeping.RunService/Get', status: 0, durationMs: 3 };

    it('should log a single line JSON entry with the same structure for every protocol', () => {
        const logger = { infoMessage: sinon.fake() };
        const apiRequestLogger = new ApiRequestLogger({ logger, silent: false });

        apiRequestLogger.log({ ...request, userId: 4, params: { runNumber: 12 } });
        apiRequestLogger.log({ protocol: 'http', method: 'GET', route: '/api/runs', status: 200, durationMs: 5, bytes: 10 });

        expect(logger.infoMessage.callCount).to.equal(2);
        const [grpcEntry, httpEntry] = logger.infoMessage.getCalls().map(({ args: [message] }) => {
            expect(message).to.not.include('\n');
            return JSON.parse(message);
        });

        expect(grpcEntry).to.eql({
            type: 'api_request',
            protocol: 'grpc',
            method: null,
            route: '/o2.bookkeeping.RunService/Get',
            status: 0,
            durationMs: 3,
            userId: 4,
            bytes: null,
            params: '{"runNumber":12}',
        });
        expect(Object.keys(httpEntry)).to.eql(Object.keys(grpcEntry).filter((key) => key !== 'params'));
    });

    it('should stringify bigints, omit empty params and truncate too long ones', () => {
        expect(ApiRequestLogger.stringifyParams({ id: 12n })).to.equal('{"id":"12"}');
        expect(ApiRequestLogger.stringifyParams({})).to.be.null;
        expect(ApiRequestLogger.stringifyParams(undefined)).to.be.null;

        const truncated = ApiRequestLogger.stringifyParams({ text: 'a'.repeat(MAX_PARAMS_LENGTH * 2) });
        expect(truncated).to.have.lengthOf(MAX_PARAMS_LENGTH + 1);
        expect(truncated.endsWith('…')).to.be.true;
    });

    it('should not log anything when silent, and never throw', () => {
        const logger = { infoMessage: sinon.fake() };
        new ApiRequestLogger({ logger, silent: true }).log(request);
        expect(logger.infoMessage.called).to.be.false;

        const circular = {};
        circular.self = circular;
        expect(() => new ApiRequestLogger({ logger, silent: false }).log({ ...request, params: circular })).to.not.throw();
        expect(() => new ApiRequestLogger({ logger: { infoMessage: () => {
            throw new Error('failing logger');
        } }, silent: false }).log(request)).to.not.throw();
    });

    it('should measure elapsed milliseconds', () => {
        const stopTimer = new ApiRequestLogger({ silent: true }).startTimer();
        expect(stopTimer()).to.be.a('number').and.to.be.at.least(0);
    });
};
