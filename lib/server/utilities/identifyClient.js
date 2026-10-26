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

const { ApiClients } = require('../../domain/enums/ApiClients.js');
const { ApiDevices } = require('../../domain/enums/ApiDevices.js');

/**
 * Ordered list of the clients patterns: Postman, the gRPC clients, then the specific tools must come before the generic browser pattern
 *
 * @type {Array<[RegExp, ApiClients]>}
 */
const CLIENTS_PATTERNS = [
    // Postman must come first: its HTTP user agent is PostmanRuntime/x, its gRPC one is the Node gRPC one suffixed (grpc-node-js/x-postman.y)
    [/postman/i, ApiClients.POSTMAN],
    // The gRPC clients must come first, as their user agent may contain the name of the underlying library (for example grpc-java-okhttp)
    [/grpc-node/i, ApiClients.GRPC_NODE],
    [/grpc-c\+\+/i, ApiClients.GRPC_CXX],
    [/grpc-python/i, ApiClients.GRPC_PYTHON],
    [/grpc-go/i, ApiClients.GRPC_GO],
    [/grpc-java/i, ApiClients.GRPC_JAVA],
    [/grpc-/i, ApiClients.GRPC_OTHER],
    [/^curl\//i, ApiClients.CURL],
    [/^wget\//i, ApiClients.WGET],
    [/python-requests|python-urllib|python-httpx|aiohttp|^python\//i, ApiClients.PYTHON],
    [/axios|node-fetch|undici|^node$/i, ApiClients.NODE],
    [/go-http-client/i, ApiClients.GO],
    // JVM clients: HttpURLConnection (Java/x), the JDK HttpClient, Apache HttpClient and OkHttp (also used by Android and Kotlin applications)
    [/^Java\/|^Java-http-client|Apache-HttpClient|okhttp/i, ApiClients.JAVA],
    [/^Mozilla\/5\.0.*(chrome|crios|safari|firefox|fxios|edg|opr)\//i, ApiClients.BROWSER],
];

/**
 * Identify the device of a browser
 *
 * @param {string} userAgent the user agent of the browser
 * @param {string} [mobileHint] the value of the Sec-CH-UA-Mobile header (sent by chromium based browsers: ?1 for phones, ?0 otherwise)
 * @return {ApiDevices} the device
 */
const identifyDevice = (userAgent, mobileHint) => {
    if (/iPad|Tablet/i.test(userAgent)) {
        return ApiDevices.TABLET;
    }
    if (/iPhone|iPod|Windows Phone|Opera Mini/i.test(userAgent)) {
        return ApiDevices.PHONE;
    }
    // Android tablets do not declare "Mobile" in their user agent, phones do
    if (/Android/i.test(userAgent)) {
        return /Mobile/i.test(userAgent) ? ApiDevices.PHONE : ApiDevices.TABLET;
    }
    return /Mobile/i.test(userAgent) || mobileHint === '?1' ? ApiDevices.PHONE : ApiDevices.DESKTOP;
};

/**
 * Identify the client of the API from the user agent it declares. This is self-reported, so it is meant for statistics only and must never be
 * used for security purposes. Note that an iPad requesting the desktop version of websites (default since iPadOS 13) can not be told apart from
 * a Mac
 *
 * @param {object} [headers] the user agent and optional client hints
 * @param {string} [headers.userAgent] the user agent
 * @param {string} [headers.mobileHint] the value of the Sec-CH-UA-Mobile header
 * @return {{client: ApiClients, device: (ApiDevices|null)}} the client and, for browsers only, the device (null otherwise)
 */
exports.identifyClient = ({ userAgent, mobileHint } = {}) => {
    if (typeof userAgent !== 'string') {
        return { client: ApiClients.UNKNOWN, device: null };
    }

    const [, client = ApiClients.UNKNOWN] = CLIENTS_PATTERNS.find(([pattern]) => pattern.test(userAgent)) ?? [];

    return { client, device: client === ApiClients.BROWSER ? identifyDevice(userAgent, mobileHint) : null };
};
