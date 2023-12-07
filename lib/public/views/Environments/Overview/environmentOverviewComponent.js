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

import { h } from '/js/src/index.js';
import { table } from '../../../components/common/newTable/table.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';
import { displayEnvironmentStatus } from '../format/displayEnvironmentStatus.js';
import { formatRunsList } from '../../Runs/format/formatRunsList.js';
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';

import spinner from '../../../components/common/spinner.js';

const TABLEROW_HEIGHT = 46;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * @type {CellRenderers}
 */
const evironmentTableRenderers = {
    id: (id) => id,
    updatedAt: (timestamp) => formatTimestamp(timestamp),
    createdAt: (timestamp) => formatTimestamp(timestamp),
    status: ({ status, historyItems }) => displayEnvironmentStatus({ status, historyItems }),
    statusMessage: (message) => message,
    runs: formatRunsList,
};

/**
 * The shows the environment table
 * @param {PaginationModel} pagination the environment's pagination model
 * @param {RemoteData} envs Environment objects
 * @param {TableModel} tableModel an instance of a table model for environments
 * @returns {Object} Html page
 */
export const environmentOverviewComponent = (pagination, envs, tableModel) => {
    pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    // TODO: This is temporary. Should table deal with remote data?
    if (!envs.isSuccess()) {
        return spinner({ size: 5, absolute: false });
    }

    envs = envs.payload;

    return [
        h('.w-100.flex-column', [
            h('.header-container.pv2'),
            table(envs, {
                id: { header: 'id', model: tableModel.id, renderer: evironmentTableRenderers.id },
                updatedAt: { header: 'Updated At', model: tableModel.updatedAt, renderer: evironmentTableRenderers.updatedAt },
                createdAt: { header: 'Created At', model: tableModel.createdAt, renderer: evironmentTableRenderers.createdAt },
                status: { header: 'Status', model: tableModel.status, renderer: evironmentTableRenderers.status },
                statusMessage: { header: 'Status Message', model: tableModel.statusMessage, renderer: evironmentTableRenderers.statusMessage },
                runs: { header: 'Runs', model: tableModel.runs, renderer: evironmentTableRenderers.runs },
            }, getEnvironmentTableRowKey, getRowsClasses, getRowsConfig),
            paginationComponent(pagination),
        ]),
    ];
};

/**
 * Takes an environment, checks it's status and status history and returns the relevant css class.
 * @param {Environment} environment the environment to be formatted
 * @returns {string} CSS class
 */
const getRowsClasses = (environment) => {
    const hasOrHadError = environment.status === 'ERROR' || environment.historyItems.some((item) => item.status === 'ERROR');
    return `.table-sm${hasOrHadError ? '.danger' : ''}`;
};

/**
 * Returns a unique vnode key based on the environment being displayed in this row
 * @param {T} row The envrionment being displayed in this row
 * @returns {string} a unique string to be used as the vnode key for this row
 */
const getEnvironmentTableRowKey = (row) => row.id;

/**
 * An example where clicking on the row prints the environment id corresponding to this row
 * @param {Environment} row the environment corresponding to this row
 * @returns {Object} an object to be passed to h() with the row config
 */
const getRowsConfig = (row) => ({ onclick: () => console.log(`hello ${row.id}`) });
