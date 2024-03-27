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

import { amountFilter } from '../common/filters/amountFilter.js';

/**
 * Returns the author filter component
 * @param {RunsOverviewModel} runModel the runs model object
 * @return {vnode} A text box that lets the user look for logs with a specific author
 */
const nDetectorsFilter = (runModel) => amountFilter(runModel.getNDetectorsFilter(), (filter) => runModel.setNDetectorsFilter(filter), {
    operatorAttributes: {
        id: 'nDetectors-operator',
    },
    limitAttributes: {
        id: 'nDetectors-limit',
    },
});

export default nDetectorsFilter;
