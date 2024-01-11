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
import spinner from '../../../components/common/spinner.js';
import { TAG_DETAILS_PANELS_KEYS } from './TagDetailsModel.js';
import { h, sessionService } from '@aliceo2/web-ui-frontend';
import { tagDetail } from '../../../components/tag/tagDetail.js';
import { table } from '../../../components/common/table/table.js';
import { logsActiveColumns } from '../../Logs/ActiveColumns/logsActiveColumns.js';
import errorAlert from '../../../components/common/errorAlert.js';
import { BkpRoles } from '../../../domain/enums/BkpRoles.js';
import { tabbedPanelComponent } from '../../../components/TabbedPanel/tabbedPanelComponent.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';

import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
const TABLEROW_HEIGHT = 59;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Returns the component to display the details of a given tag
 *
 * @param {TagDetailsModel} tagDetailsModel the tag details model
 * @return {Component} the tag details display
 */
export const tagDetailsComponent = (tagDetailsModel) => tagDetailsModel.tagDetails.match({
    NotAsked: () => null,
    Loading: () => spinner(),

    /**
     * Displays the tag details
     *
     * @param {Tag} tag the tag to display
     * @return {Component} the tag details
     */
    Success: (tag) => {
        tagDetailsModel.tabbedPanelModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
            TABLEROW_HEIGHT,
            PAGE_USED_HEIGHT,
        ));

        return [
            h('.flex-column.w-100', [
                h('.w-100.flex-row', [
                    h('.flex-row.items-center.gc3', [
                        h('h2.mv2.flex-row', `Tag: ${tag.text}`),
                        tag.archived ? h('.f4.badge.bg-gray-darker.white', 'Archived') : null,
                    ]),
                    h('.flex-grow.flex-row.items-center', {
                        style: 'justify-content: flex-end;',
                    }, sessionService.hasAccess(BkpRoles.ADMIN) && h('.btn-group', [
                        tagDetailsModel.isEditModeEnabled ?
                            [
                                h('.button.btn.btn-success#confirm-tag-edit', {
                                    onclick: () => {
                                        tagDetailsModel.updateOneTag();
                                    },
                                }, 'Save'),
                                h('.button.btn#cancel-tag-edit', { onclick: () => tagDetailsModel.clearTagChanges() }, 'Cancel'),
                            ]
                            : [
                                h('#edit-tag.button.btn.btn-primary', {
                                    onclick: () => {
                                        tagDetailsModel.setTagChange('description', tag.description);
                                        tagDetailsModel.setTagChange('mattermost', tag.mattermost);
                                        tagDetailsModel.setTagChange('email', tag.email);
                                        tagDetailsModel.setTagChange('archivedAt', tag.archivedAt);
                                        tagDetailsModel.isEditModeEnabled = true;
                                    },
                                }, 'Edit Tag'),
                            ],
                    ])),
                ]),
            ]),
            h('.flex-row.w-100', [h('.w-40.ph1', tagDetail(tagDetailsModel, tag))]),
            h('.w-100', tabbedPanelComponent(
                tagDetailsModel.tabbedPanelModel,
                { [TAG_DETAILS_PANELS_KEYS.LOGS]: 'Logs with this tag' },
                {
                    [TAG_DETAILS_PANELS_KEYS.LOGS]: (currentPageLogs) => table(
                        currentPageLogs,
                        logsActiveColumns,
                        null,
                        { profile: 'embeded' },
                    ),
                },
            )),
            paginationComponent(tagDetailsModel.tabbedPanelModel.pagination),
        ];
    },
    Failure: (errors) => errors.map(errorAlert),
});
