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
import { markdownDisplay } from '../common/markdown/markdown.js';

/**
 * Returns a component displaying the text of a log
 *
 * @param {Log} log the log to display
 * @param {Boolean} isCollapsed an indicator as to whether the log is collapsed
 * @return {Component} the log's text display
 */
export const logText = (log, isCollapsed) => h(
    `div#log-id-${log.id}`,
    isCollapsed
        ? h(`.text-ellipsis.w-100#log-text-${log.id}`, log.text)
        : markdownDisplay(log.text, {
            classes: 'w-100',
            id: `log-text-${log.id}`,
        }),
);
