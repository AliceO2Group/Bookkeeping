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

/**
 * Display a list of EOR reasons
 * @param {EorReason[]} eorReasons the list of EOR reasons to display
 * @return {Component} the display component
 */
export const displayRunEorReasonsOverview = (eorReasons) =>
    eorReasons.map(({ category, title, description }) => {
        const titleString = title ? ` - ${title}` : '';
        const descriptionString = description ? ` - ${description}` : '';
        return [`${category} ${titleString} ${descriptionString}`, h('br')];
    });
