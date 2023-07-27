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

import { h, iconCheck, iconX } from '/js/src/index.js';

/**
 * A green success badge with the tick icon
 * @param {string} text to display in the badge
 * @return {vnode} the badge
 */
const statusBadgeSuccess = (text) =>
    h('div.badge.success.b-success.b1.mr1', h('div.flex-row', [h('.mr1', text), h('', iconCheck())]));

/**
 * A red failure badge with the X icon
 * @param {string} text to display in the badge
 * @return {vnode} the badge
 */
const statusBadgeFail = (text) =>
    h('div.badge.danger.b-danger.b1.mr1', h('div.flex-row', [h('.mr1', text), h('', iconX())]));

/**
 * A collection of details to show per service, with a format function to
 * determine how they should be rendered
 *
 * @return {Object} A key-value collection of all relevant fields
 */
const detailsFields = {
    version: {
        name: 'Version',
        format: (version) => h('em.f4', `${version}`),
    },
    host: {
        name: 'Hostname',
        format: (host) => host,
    },
    port: {
        name: 'Port',
        format: (port) => port,
    },
    status: {
        name: 'Status',
        format: (statuses) => h(
            'div.flex-row.flex-wrap.justify-end',
            Object.entries(statuses).map(([name, value]) =>
                value ? statusBadgeSuccess(name) : statusBadgeFail(name)),
        ),
    },
};

/**
 * The title banner for the service details displaying the name of the service, its
 * version, and a badge for each status.
 * @param {string} serviceName the name of the service
 * @param {string} version the version of the service e.g. 1.2.3
 * @param {Object} status an object {statusName: boolean}
 * @return {vnode} a div with the title, version, and status of the service
 */
const serviceDetailsPanelTitle = (serviceName, version, status) =>
    h('div.flex-row.flex-wrap.justify-between.bg-gray-light.p2.g2', [
        h('div.flex-row.g2.items-center ', [
            h('h4', serviceName),
            version
                ? detailsFields.version.format(version)
                : '',
        ]),
        h('div', detailsFields.status.format(status)),
    ]);

/**
 * Displays a list of the given details for a service.
 * @param {Object} details An object of details {name: value}
 * @return {vnode} listing each detail and its value
 */
const serviceDetailsPanel = (details) =>
    Object.entries(details).map(([key, value]) =>
        h('div.w-100.flex-row.justify-between', [
            h('h6', detailsFields[key].name),
            h('div', detailsFields[key].format(value)),
        ]));

/**
 * Displays panels containing information about each service.
 * @param {RemoteData} appInfo a RemoteData containing information about the bookkeeping app
 * @param {RemoteData} dbInfo a RemoteData containing information about the database
 * @return {vnode} a grid of panels, one for each service
 */
const servicesInfo = (appInfo, dbInfo) => {
    const services = [
        { name: 'Bookkeeping', infoRemoteData: appInfo },
        { name: 'Database', infoRemoteData: dbInfo },
    ];

    return services.map((s) => h(`div#${s.name}.flex-column.shadow-level1.flex-grow`, [
        serviceDetailsPanelTitle(
            s.name,
            s.infoRemoteData.isSuccess() ? s.infoRemoteData.payload.version : '',
            s.infoRemoteData.isSuccess() ? s.infoRemoteData.payload.status : '',
        ),
        h('div.p2', s.infoRemoteData.match({
            NotAsked: () => 'Not Asked',
            Loading: () => 'Fetching Details',
            Success: (payload) => serviceDetailsPanel(payload.details),
            Failure: () => 'Error fetcing details',
        })),
    ]));
};

/**
 * Returns a view of information panels for each service
 * @param {object} model Pass the model to access the defined functions
 * @return {vnode} the view of services
 */
const aboutOverview = (model) => {
    const { appInfo } = model.AboutModel;
    const { dbInfo } = model.AboutModel;
    return h('.flex-row.pv2.g2', servicesInfo(appInfo, dbInfo));
};

export default (model) => [aboutOverview(model)];
