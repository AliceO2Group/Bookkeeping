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

const { expect } = require('chai');
const buildEndpoints = require('../../../../lib/server/routers');

const { bindRoute } = buildEndpoints;

/**
 * Returns a fake http server recording the routes bound to it
 *
 * @return {{registered: object[]}} the http server
 */
const createFakeHttp = () => {
    const http = { registered: [] };
    ['get', 'post', 'put', 'patch', 'delete'].forEach((method) => {
        http[method] = (path, ...callbacks) => http.registered.push({ method, path, callbacks: callbacks.slice(0, -1) });
    });
    return http;
};

module.exports = () => {
    it('should bind every declared route with a controller function', () => {
        const http = createFakeHttp();
        buildEndpoints(http);

        expect(http.registered).to.not.be.empty;
        http.registered.forEach(({ callbacks }) => expect(callbacks).to.not.be.empty);
    });

    it('should bind the routes of a valid route tree, ignoring nodes that only group children', () => {
        const http = createFakeHttp();
        bindRoute(http, {
            method: 'get',
            path: '/group',
            children: [{ method: 'post', path: '/child', controller: [() => null, () => null] }],
        });

        expect(http.registered.map(({ method, path }) => [method, path])).to.eql([['post', '/group/child']]);
    });

    it('should throw when a route declares an undefined controller', () => {
        expect(() => bindRoute(createFakeHttp(), { method: 'get', path: '/missing', controller: undefined }))
            .to.throw('Route GET /missing declares a controller that is not a function');
    });

    it('should throw when a nested route declares a controller list containing an undefined controller', () => {
        const route = { path: '/parent', children: [{ method: 'put', path: '/child', controller: [() => null, undefined] }] };
        expect(() => bindRoute(createFakeHttp(), route)).to.throw('Route PUT /parent/child declares a controller that is not a function');
    });
};
