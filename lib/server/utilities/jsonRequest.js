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

const http = require('http');
const https = require('https');

/**
 * Return http or https module depending on given url
 * @param {URL} url http(s) url
 * @return {Module} http ot https module
 */
function checkClientType(url) {
    switch (url.protocol) {
        case 'http:':
            return http;
        case 'https:':
            return https;
        default:
            throw new Error(`Incorrect protocol in url: <${url.protocol}>`);
    }
}

/**
 * Make request expecting response as json
 * @param {URL} url url
 * @param {object} options all options from http.request or https.request depending on given url and additional ones
 * @param {function<URL, URL>} [options.redirectCallback] function that takes url to which
 * a request is redirected and return some custom url // reason: MonALISA redirects override some url search parameters.
 * @return {Promise<JSON>} response
 */
function jsonRequest(url, options = {}) {
    url = new URL(url);
    return new Promise((resolve, reject) => {
        let rawData = '';
        const req = checkClientType(url).request(url, options, async (res) => {
            const { statusCode } = res;
            const contentType = res.headers['content-type'];

            let error;
            let redirected = false;
            if (statusCode == 302 || statusCode == 301) {
                if (options.allowRedirects) {
                    redirected = true;
                    let nextLocation;
                    if (res.header.location.match(/^http/)) {
                        nextLocation = new URL(res.header.location);
                    } else {
                        nextLocation = new URL(url.origin + res.headers.location);
                    }
                    resolve(await jsonRequest(options.redirectCallback?.call(nextLocation) ?? nextLocation));
                } else {
                    error = new Error(`Redirect to ${res.header.location} not allowed`);
                }
            } else if (statusCode !== 200) {
                error = new Error(`Request Failed. Status Code: ${statusCode}`);
            } else if (!/^application\/json/.test(contentType)) {
                error = new Error(`Invalid content-type. Expected application/json but received ${contentType}`);
            }

            if (error) {
                reject(error);
            }

            res.on('data', (chunk) => {
                rawData += chunk;
            });

            res.on('end', () => {
                try {
                    if (!redirected) {
                        resolve(JSON.parse(rawData));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.end();
    });
}

exports.jsonRequest = jsonRequest;
