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

import { Color } from '../common/colors.js';

export const QcSummaryColors = Object.freeze({

    /**
     * In case whole run is covered by good flag(-s)
     */
    ALL_GOOD: Color.SUCCESS_DARK,

    /**
     * In case run is partially covered by good flag(-s) and there is not bad flag
     */
    PARTIALLY_GOOD_NOT_BAD: Color.GRAY_DARKER,

    /**
     * In case whole run is covered by bad flag(-s)
     */
    ALL_BAD: Color.DANGER,

    /**
     * In case run is partially covered by bad flag(-s)
     */
    PARTIALLY_BAD: Color.WARNING,

    /**
     * In case run all assigned flags are bad and at least one of them is of type Limited Acceptance MC reproducible
     *
     * The color should be the same like one assigned to flag type Limited Acceptance MC Reproducible
     * Because of complexity imposed by retrieving it from DB this information is hardcoded here
     */
    LIMITED_ACCEPTANCE_MC_REPRODUCIBLE: '#BB9D30',

    /**
     * In case coverage is incalculable
     */
    INCALCULABLE_COVERAGE: Color.GRAY,
});
