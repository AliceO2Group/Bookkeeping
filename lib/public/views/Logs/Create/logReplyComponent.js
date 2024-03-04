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

import { h, iconExternalLink } from '/js/src/index.js';
import errorAlert from '../../../components/common/errorAlert.js';
import { logCreationForm } from './logCreationComponent.js';
import spinner from '../../../components/common/spinner.js';
import { logDisplayComponent } from '../../../components/Log/logDisplayComponent.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { logCreationContentPanel } from './panels/LogCreationContentPanel.js';

/**
 * Returns a reply to Log button.
 *
 * @param {Log} log the log to which reply is created
 * @return {Component} The reply button.
 */
const logDetailsButton = (log) => frontLink(
    h('.flex-row.g2', [iconExternalLink(), 'Details']),
    'log-detail',
    { id: log.id },
    {
        id: 'parent-log-details',
        class: 'btn btn-primary',
    },
);

/**
 * Display a log reply form
 *
 * @param {LogReplyModel} logReplyModel the log reply model
 * @return {Component} the form
 */
export const logReplyComponent = (logReplyModel) => [
    logReplyModel.createdLog.match({
        Failure: (errors) => errors.map(errorAlert),
        Other: () => null,
    }),
    logReplyModel.parentLog.match({
        NotAsked: () => null,
        Success: (parentLog) => logCreationForm(logReplyModel, {
            title: h('h3', ['Reply to: ', h('strong', parentLog.title)]),
            mainPane: [
                logDisplayComponent(
                    parentLog,
                    logReplyModel.isParentLogCollapsed,
                    (collapsed) => {
                        logReplyModel.isParentLogCollapsed = collapsed;
                    },
                    {
                        hideTitle: true,
                        customActionButtons: logDetailsButton(parentLog),
                    },
                ),
                // eslint-disable-next-line no-return-assign
                logCreationContentPanel(logReplyModel.text, (newContent) => logReplyModel.text = newContent),
            ],
        }),
        Failure: (errors) => errorAlert(errors),
        Loading: () => spinner({ absolute: false, size: 3 }),
    }),
];
