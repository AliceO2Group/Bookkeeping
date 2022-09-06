/*
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

import spinner from '../../../common/spinner.js';
import { tagFilter } from './tagFilter.js';

/**
 * Return a filter component to apply filtering on a remote data list of tags, handling each possible remote data status
 *
 * @param {RemoteData} tagsRemoteData the remote data tags list
 * @param {TagFilterModel} filter The model storing the filter's state
 *
 * @return {vnode|vnode[]|null} A collection of checkboxes to toggle table rows by tags
 */
export const remoteDataTagFilter = (tagsRemoteData, filter) => tagsRemoteData.match({
    NotAsked: () => null,
    Loading: () => spinner({
        size: 2,
        justify: 'left',
        absolute: false,
    }),
    Success: (tags) => tagFilter(tags, filter),
    Failure: () => null,
});
