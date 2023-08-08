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
 * @returns {vnode} the badge
 */
const statusBadgeSuccess = (text) =>
    h('.badge.success.b-success.b1.mr1', h('.flex-row', [h('.mr1', text), h('', iconCheck())]));

/**
 * A red failure badge with the X icon
 * @param {string} text to display in the badge
 * @returns {vnode} the badge
 */
const statusBadgeFail = (text) =>
    h('.badge.danger.b-danger.b1.mr1', h('.flex-row', [h('.mr1', text), h('', iconX())]));

/**
 * A collection of details to show per service, with a format function to
 * determine how they should be rendered
 *
 * @returns {Object} A key-value collection of all relevant fields
 */
const fieldFormatting = {
    version: {
        name: 'Version',
        format: (version) => h('em.f4.version', `${version}`),
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
            '.flex-row.flex-wrap.justify-start',
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
 * @returns {vnode} a div with the title, version, and status of the service
 */
const servicePanelTitle = (serviceName, version = '') =>
    h('.flex-row.flex-wrap.justify-between.bg-gray-light.p2.g2', [
        h('.flex-row.g2.items-center ', [
            h('h4', serviceName),
            fieldFormatting.version.format(version)
        ]),
    ]);

const notAskedPanelBody = () => 'Loading'

const loadingPanelBody = () => 'Not Asked'

const successPanelBody = (status) => {
    return h('', fieldFormatting.status.format(status))
}

const failurePanelBody = (status) => {
    return h('.flex-column.g2', [
        h('', fieldFormatting.status.format(status)),
        h('.danger', 'Error fetching details, please contact an administrator.'),
    ])
}

const servicePanel = ({ name, infoRemoteData }) => {
    const panelBody = infoRemoteData.match({
        NotAsked: notAskedPanelBody,
        Loading: loadingPanelBody,
        Success: ({ status }) => successPanelBody(status),
        Failure: ({ status }) => failurePanelBody(status),
    })

    const version = infoRemoteData.isSuccess() ? infoRemoteData.payload.version : ''

    return h(`#${name}.flex-column.shadow-level1.flex-grow`, [
        servicePanelTitle(name, version),
        h('.p2', panelBody),
    ])
}

/**
 * Returns a view of information panels for each service
 * @param {object} model Pass the model to access the defined functions
 * @returns {vnode} the view of services
 */
const aboutOverview = ({ aboutModel }) => {
    const services = aboutModel.getServices();
    return h('.flex-row.pv2.g2', services.map(servicePanel));
};

export default (model) => [aboutOverview(model)];
