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

import { frontLinks } from '../../../components/common/navigation/frontLinks.js';

/**
 * Format a given run list as a list of hyperlink to their details page
 * @param {Run[]} runs the list of runs to display
 * @return {Component} the list of runs
 */
export const formatRunsList = (runs) => frontLinks(runs, ({ runNumber, id }) => ({
    content: runNumber,
    page: 'run-detail',
    parameters: { id },
}));
