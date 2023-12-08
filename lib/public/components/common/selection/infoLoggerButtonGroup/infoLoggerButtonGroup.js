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

import { h } from '/js/src/index.js';
import { getInfologgerLink } from '../../../../services/externalRouting/getInfologgerLink.js';
import { CopyToClipboardComponent } from './CopyToClipboardComponent.js';
import { identifierColumnAndActionsDropdown } from './identifierColumnAndActionsDropdown.js';

/**
 * Generates an infologger link component with the given infologger link and label.
 *
 * @param {string} infologger The infologger link.
 * @param {string} label The label for the link.
 * @return {Component|null} The infologger link component, or null if the infologger is not available.
 */
const generateInfologgerLink = (infologger, label) => infologger && h('a', { href: infologger, target: '_blank' }, label);

/**
 * Renders a button group that links to a specific details page based on the given parameters,
 * and a dropdown menu with options to copy the link or access the related infologgers.
 *
 * @param {Object} parameters The parameters that specify what links to display for the details page and the infologgers.
 * @return {Component} The infologger button group component.
 */
export const infoLoggerButtonGroup = (parameters) => {
    const { flp: flpInfologger, epn: epnInfologger } = getInfologgerLink(parameters);
    const flpComponent = generateInfologgerLink(flpInfologger, 'Infologger FLP');
    const epnComponent = generateInfologgerLink(epnInfologger, 'Infologger EPN');

    const { environmentId, runNumber } = parameters;

    if (runNumber) {
        return identifierColumnAndActionsDropdown('run-detail', runNumber, parameters, [
            h(CopyToClipboardComponent, { value: runNumber }, 'Copy Run Number'),
            flpComponent,
            epnComponent,
        ]);
    }

    if (environmentId) {
        return identifierColumnAndActionsDropdown('env-details', environmentId, parameters, [
            h(CopyToClipboardComponent, { value: environmentId }, 'Copy Environment Id'),
            flpComponent,
            epnComponent,
        ]);
    }
};
