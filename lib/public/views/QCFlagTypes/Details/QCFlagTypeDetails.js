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
import { badge } from '../../../components/common/badge.js';
import { colorInputComponent } from '../../../components/common/form/inputs/colorInputComponent.js';
import { detailsList } from '../../../components/Detail/detailsList.js';
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';

/**
 * The method to correctly format the current values given from the backend
 *
 * @param {TagDetailsModel} detailsModel the tag details model
 * @return {Object} A collection of field data
 */
const activeFields = (detailsModel) => ({
    id: {
        name: 'ID',
        visible: true,
        primary: true,
    },
    name: {
        name: 'Name',
        visisble: true,
        size: 'cell-l',
    },
    method: {
        name: 'Method',
        visisble: true,
        size: 'cell-l',
    },
    updatedAt: {
        name: 'Last modified',
        visible: true,
        size: 'cell-m',
        format: (timestamp) => formatTimestamp(timestamp),
    },
    lastUpdatedBy: {
        name: 'Last modified by',
        visible: true,
        size: 'cell-m',
        format: (user) => user ? user.name : '-',
    },
    createdAt: {
        name: 'Created at',
        visible: true,
        size: 'cell-m',
        format: (timestamp) => formatTimestamp(timestamp),
    },
    createdBy: {
        name: 'Created by',
        visible: true,
        size: 'cell-m',
        format: (user) => user ? user.name : '-',
    },
    archived: {
        name: 'Archived',
        visible: true,
        size: 'cell-l',
        format: (archived) => detailsModel.isEditModeEnabled
            ? h(
                'label.flex-row.g1.items-center',
                [
                    'No',
                    h('.switch#tag-archive-toggle', [
                        h(
                            'input',
                            {
                                checked: Boolean(detailsModel.patch.archived),
                                onchange: () => {
                                    detailsModel.patch.archived = !detailsModel.patch.archived;
                                },
                                type: 'checkbox',
                            },
                        ),
                        h('span.slider.round'),
                    ]),
                    'Yes',
                ],
            )
            : archived ? 'Yes' : 'No',
    },
    color: {
        name: 'Color',
        visible: true,
        classes: 'w-10 f6',
        format: (color) => detailsModel.isEditModeEnabled
            ? colorInputComponent(detailsModel.patch.color, (color) => {
                detailsModel.patch.color = color;
            })
            : color ? badge(color, { color }) : '-',
    },
});

/**
 * A detail page with provides information about QC Flag Type.
 *
 * @param {QCFlagTypeDetailsModel} qcFlagTypeDetailsModel Pass the model to access the defined functions.
 * @param {QCFlagType} qcFlagType all data related to the QC Flag Type
 * @return {Componeny} QC Flag Tpe details list
 */
export const qcFlagTypeDetailsList = (qcFlagTypeDetailsModel, qcFlagType) => detailsList(
    activeFields(qcFlagTypeDetailsModel),
    qcFlagType,
    { selector: 'tag', attributes: { class: 'flex-column g2' } },
);
