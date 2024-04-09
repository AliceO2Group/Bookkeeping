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

import { configurationService } from '../configurationService.js';
import { buildUrl } from '../../utilities/fetch/buildUrl.js';

const QC_GUI_LAYOUT_SHOW_PAGE = 'layoutShow';

/**
 * Return the QC GUI URL to be used for the given run
 *
 * @param {Run} run the run for which QC link must be displayed
 * @return {string|null} the URL
 */
export const getRunQcGuiLinkUrl = (run) => {
    /**
     * @type {AppConfiguration} configuration the app configuration
     */
    const { QcGuiUrl: qcgUrl } = configurationService.configuration$.getCurrent().match({
        Success: (configuration) => configuration,
        Other: () => ({}),
    });

    if (!qcgUrl) {
        return null;
    }

    const { definition, detectors, pdpBeamType, runNumber } = run;
    const urlParams = {
        page: QC_GUI_LAYOUT_SHOW_PAGE,
        runNumber,
        definition,
    };

    if (detectors.length === 1) {
        [urlParams.detector] = detectors;
    }

    if (pdpBeamType) {
        urlParams.pdpBeamType = pdpBeamType;
    }

    return buildUrl(qcgUrl, urlParams);
};
