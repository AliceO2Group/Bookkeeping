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

import runNumberFilter from '../../../components/Filters/RunsFilter/runNumber.js';
import { displayRunNumber } from '../format/displayRunNumber.js';

export const RunsPeriodActiveColumns = {
    id: {
        name: 'ID',
        visible: false,
        primary: true,
    },
    runNumber: {
        name: 'Run',
        visible: true,
        size: 'w-10 f6 w-wrapped',
        filter: runNumberFilter,
        format: (_, run) => displayRunNumber(run),
        profiles: {
            lhcFill: true,
            environment: true,
            home: {
                name: 'Number',
                format: null,
                size: 'w-20',
            },
        },
    },
};
