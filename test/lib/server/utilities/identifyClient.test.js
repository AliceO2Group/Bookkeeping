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
const { identifyClient } = require('../../../../lib/server/utilities/identifyClient.js');

const CHROME_DESKTOP = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const FIREFOX_DESKTOP = 'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0';
const SAFARI_MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const IPAD = 'Mozilla/5.0 (iPad; CPU OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1';
const ANDROID_PHONE = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const ANDROID_TABLET = 'Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const FIREFOX_ANDROID_TABLET = 'Mozilla/5.0 (Android 13; Tablet; rv:121.0) Gecko/121.0 Firefox/121.0';

module.exports = () => {
    it('should identify the tools and libraries from their default user agent', () => {
        const expectations = {
            'curl/8.4.0': 'curl',
            'Wget/1.21.4': 'wget',
            'python-requests/2.31.0': 'python',
            'Python-urllib/3.11': 'python',
            'python-httpx/0.25.0': 'python',
            'Python/3.11 aiohttp/3.9.0': 'python',
            'axios/1.6.0': 'node',
            node: 'node',
            'Go-http-client/1.1': 'go',
            'Java/17.0.2': 'java',
            'Java-http-client/11.0.20': 'java',
            'Apache-HttpClient/4.5.13 (Java/11.0.20)': 'java',
            'okhttp/4.12.0': 'java',
            'PostmanRuntime/7.36.0': 'postman',
            'grpc-node-js/1.14.0-postman.4': 'postman',
            'grpc-node-js/1.9.0': 'grpc-node',
            'grpc-c++/1.60.0 grpc-c/37.0.0 (linux; chttp2)': 'grpc-cxx',
            'grpc-python/1.60.0': 'grpc-python',
            'grpc-go/1.60.0': 'grpc-go',
            'grpc-java-netty/1.60.0': 'grpc-java',
            'grpc-java-okhttp/1.60.0': 'grpc-java',
            'grpc-dotnet/2.60.0': 'grpc-other',
            'Mozilla/5.0 (compatible; MyScraper)': 'unknown',
            something: 'unknown',
        };

        for (const [userAgent, client] of Object.entries(expectations)) {
            expect(identifyClient({ userAgent }), userAgent).to.eql({ client, device: null });
        }
    });

    it('should identify browsers and their device', () => {
        const expectations = [
            [CHROME_DESKTOP, undefined, 'desktop'],
            [FIREFOX_DESKTOP, undefined, 'desktop'],
            [SAFARI_MAC, undefined, 'desktop'],
            [IPHONE, undefined, 'phone'],
            [IPAD, undefined, 'tablet'],
            [ANDROID_PHONE, undefined, 'phone'],
            [ANDROID_TABLET, undefined, 'tablet'],
            [FIREFOX_ANDROID_TABLET, undefined, 'tablet'],
            // Sec-CH-UA-Mobile is used when the user agent does not tell
            [CHROME_DESKTOP, '?1', 'phone'],
            [CHROME_DESKTOP, '?0', 'desktop'],
        ];

        for (const [userAgent, mobileHint, device] of expectations) {
            expect(identifyClient({ userAgent, mobileHint }), `${userAgent} ${mobileHint}`).to.eql({ client: 'browser', device });
        }
    });

    it('should return an unknown client when the user agent is missing', () => {
        expect(identifyClient()).to.eql({ client: 'unknown', device: null });
        expect(identifyClient({ userAgent: undefined })).to.eql({ client: 'unknown', device: null });
        expect(identifyClient({ userAgent: ['an', 'array'] })).to.eql({ client: 'unknown', device: null });
    });
};
