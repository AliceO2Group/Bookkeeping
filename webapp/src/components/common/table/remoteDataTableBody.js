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

import { noDataRow } from './noDataRow.js';
import { h } from '/js/src/index.js';
import spinner from '../spinner.js';
import errorAlert from '../errorAlert.js';

/**
 * Utility function handling the error, loading and notAsked states when displaying a remote data into a table body
 *
 * @param {RemoteData} remoteData the data to display
 * @param {function} successDisplay function called with the remote data success payload to extract the actual table body in case of success
 * @param {number} columnsCount the amount of columns displayed in the table
 * @return {Component} the table body
 */
export const remoteDataTableBody = (remoteData, successDisplay, columnsCount) => remoteData.match({
    NotAsked: () => noDataRow(columnsCount),
    Loading: () => h(
        'tr',
        h(
            'td',
            { colSpan: columnsCount },
            spinner({ size: 5, absolute: false }),
        ),
    ),
    Success: successDisplay,
    Failure: (errors) => h('tr', h('td', { colSpan: columnsCount }, errors.map(errorAlert))),
});
