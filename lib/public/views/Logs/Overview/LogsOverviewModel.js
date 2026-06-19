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

import { TagFilterModel } from '../../../components/Filters/common/TagFilterModel.js';
import { AuthorFilterModel } from '../../../components/Filters/LogsFilter/author/AuthorFilterModel.js';
import { tagsProvider } from '../../../services/tag/tagsProvider.js';
import { RawTextFilterModel } from '../../../components/Filters/common/filters/RawTextFilterModel.js';
import { TimeRangeInputModel } from '../../../components/Filters/common/filters/TimeRangeInputModel.js';
import { FilterableOverviewPageModel } from '../../../models/FilterableOverviewPageModel.js';

/**
 * Model representing handlers for log entries page
 *
 * @implements {OverviewModel}
 */
export class LogsOverviewModel extends FilterableOverviewPageModel {
    /**
     * The constructor of the Overview model object
     *
     * @param {Model} model global model
     * @param {boolean} excludeAnonymous Whether to exclude anonymous logs
     * @param {string} pageIdentifier string that indicates what page this model represents
     */
    constructor(model, excludeAnonymous = false, pageIdentifier) {
        super(
            model.router,
            pageIdentifier,
            {
                author: new AuthorFilterModel(),
                title: new RawTextFilterModel(),
                content: new RawTextFilterModel(),
                tags: new TagFilterModel(tagsProvider.items$),
                runNumbers: new RawTextFilterModel(),
                environmentIds: new RawTextFilterModel(),
                fillNumbers: new RawTextFilterModel(),
                created: new TimeRangeInputModel(),
            },
        );

        excludeAnonymous && this._filteringModel.get('author').update('!Anonymous');
    }

    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        return this.buildRootEndpoint('/api/logs');
    }
}
