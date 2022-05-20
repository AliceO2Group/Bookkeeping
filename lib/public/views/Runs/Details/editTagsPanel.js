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

/**
 * A panel containing:
 * a list of potential tags to add to a RUN
 *a button to update the tag selection
 * @param {Object} model Pass the model to access the defined functions.
 * @return {vnode} virtual node with representation of the panel
 */
const editTagsPanel = (model) => {
    const allTags = model.tags.getTags();
    const tagsAvailable = allTags.payload != 0;
    const noTagsText = 'No tags defined, please go here to create them.';
    const selectedTags = model.runs.getSelectedTags();
    return h('.flex-column.w-30', [
        h('.w-100.flex-row', {
            style: 'justify-content: flex-end;',
        }, h('button.btn.btn-success.w-25#update-tags', {
            onclick: () => model.runs.updateRunTags(),
            title: 'This action will overwrite existing tags',
            disabled: !model.runs.selectedTagsChanged(),
        }, 'Update Tags')),
        h('label.form-check-label.f5.w-100.flex-row', {
            style: 'justify-content: flex-end;',
            for: 'tags',
        }, 'Add tags to the run. (CTRL + click for multiple selection).'),
        h('.w-100.flex-row', {
            style: 'justify-content: flex-end;',
        }, h('select#tags-control.form-control.w-70', {
            multiple: true,
            size: 10,
            onchange: ({ target }) => model.runs.setSelectedTags(target.selectedOptions),
        }, !tagsAvailable ? h('option', {
            onclick: () => model.router.go('?page=tag-create'),
        }, h('a#tagCreateLink', noTagsText)) : allTags.isSuccess() ? [
            ...allTags.payload.map((tag) => h('option', {
                value: tag.id,
                selected: selectedTags.includes(tag.id),
            }, tag.text)),
        ] : h('option', { disabled: true }, 'Loading tags...'))),
    ]);
};

export default editTagsPanel;
