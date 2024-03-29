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

import { environmentOverviewComponent } from './environmentOverviewComponent.js';
import { h } from '/js/src/index.js';

/**
 * Returns the environment's overview page component
 *
 * @param {{envs: EnvironmentModel}} model The global model object.
 * @returns {Component} The page component
 */
export const EnvironmentOverviewPage = ({ envs }) => h(
    '',
    {
        onremove: () => envs.clearOverview(),
    },
    environmentOverviewComponent(envs.overviewModel.pagination, envs.overviewModel.environments),
);
