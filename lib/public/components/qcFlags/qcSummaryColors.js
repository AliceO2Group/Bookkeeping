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

import { ChartColors } from '../../views/Statistics/chartColors.js';

export const QC_SUMMARY_COLORS = {

    /**
     * In case whole run is covered by good flag(-s)
     */
    ALL_GOOD: ChartColors.Green.dark,

    /**
     * In case run is partially covered by good flag(-s) and there is not bad flag
     */
    PARTIALLY_GOOD_NOT_BAD: ChartColors.Gray.dark,

    /**
     * In case whole run is covered by bad flag(-s)
     */
    ALL_BAD: ChartColors.Red.dark,

    /**
     * In case run is partially covered by bad flag(-s)
     */
    PARTIALLY_BAD: ChartColors.Orange.dark,
};
