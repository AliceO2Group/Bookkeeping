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
import { tagPicker } from '../../../components/tag/tagPicker.js';

/**
 * A panel containing:
 * a list of potential tags to add to a RUN
 * a button to update the tag selection
 * @param {RunDetailsModel} runDetailsModel the details model
 * @return {vnode} virtual node with representation of the panel
 */
export const editTagsPanel = (runDetailsModel) => h(
    '#tags-selection.flex-column.w-30',
    tagPicker(runDetailsModel.editionTagPickerModel, { outlineSelection: true }),
);
