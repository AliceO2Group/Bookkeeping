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
import { h, switchCase, sessionService } from '/js/src/index.js';
import { tagDetail } from '../../../components/tag/tagDetail.js';
import { tabLink } from '../../../components/common/navigation/tabLink.js';
import { table } from '../../../components/common/table/table.js';
import { logsActiveColumns } from '../../Logs/ActiveColumns/logsActiveColumns.js';
import errorAlert from '../../../components/common/errorAlert.js';
import { BkpRoles } from '../../../domain/enums/BkpRoles.js';

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
        const panelsTitles = {
            [TAG_DETAILS_PANELS_KEYS.LOGS]: 'Logs with this tag',
        };

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
            h('.w-100', [
                h(
                    'ul.nav.nav-tabs',
                    Object.entries(panelsTitles).map(([key, title]) => h(
                        'li.nav-item',
                        tabLink(title, { panel: key }, { id: `${key}-tab` }, key === tagDetailsModel.defaultPanelKey),
                    )),
                ),
                h(
                    '.tab-content.p2',
                    h(
                        '.tab-pane.active',
                        { id: `${tagDetailsModel.currentPanelKey}-pane` },
                        switchCase(tagDetailsModel.currentPanelKey, {
                            [TAG_DETAILS_PANELS_KEYS.LOGS]: table(
                                tagDetailsModel.currentPanelData,
                                logsActiveColumns,
                                null,
                                { profile: 'embeded' },
                            ),
                        }, null),
                    ),
                ),
            ]),
        ];
    },
    Failure: (errors) => errors.map(errorAlert),
});
