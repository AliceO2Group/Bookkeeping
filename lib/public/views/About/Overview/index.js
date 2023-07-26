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
import { table } from '../../../components/common/table/table.js';
import spinner from '../../../components/common/spinner.js';

const appInfoTable = (appInfo) => {
    const data = [
        { type: 'Bookkeeping', version: appInfo.version, hostname: appInfo.host, port: appInfo.port },
        { type: 'NPM', version: '', hostname: '', port: '' },
    ];
    
    const aboutColumns = {
        type: { name: 'Type', size: 'cell-s', visible: true },
        version: { name: 'Version', size: 'cell-s', visible: true },
        hostname: { name: 'Hostname', size: 'cell-s', visible: true },
        port: { name: 'Port', size: 'cell-s', visible: true },
    };

    return table(data, aboutColumns);
}

/**
 * Table row header
 * @param {object} model Pass the model to access the defined functions
 * @return {vnode} Return the view of the table with the filtering options
 */
const aboutOverview = (model) => {
    const appInfo = model.AboutModel.getAppInfo()
    return h('.flex-row.pv2.w-100', appInfo.isSuccess() ? appInfoTable(appInfo.payload) : spinner());
};

export default (model) => [aboutOverview(model)];
