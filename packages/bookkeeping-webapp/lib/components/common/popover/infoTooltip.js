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
import { tooltip } from './tooltip.js';
import { h, info } from '/js/src/index.js';

/**
 * Display an info icon with a tooltip displayed on hover
 *
 * @param {Component} content the content of the help tooltip
 * @return {Component} the info icon with tooltip
 */
export const infoTooltip = (content) => tooltip(
    h('.cursor-help.h-100.w-100', { style: 'cursor: help' }, info()),
    content,
);
