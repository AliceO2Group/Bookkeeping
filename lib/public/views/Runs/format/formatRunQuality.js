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
import { RUN_QUALITIES, RunQualities } from '../../../domain/enums/RunQualities.js';

/**
 * Formatting for the run quality.
 *
 * @param {RunDetailsModel} runDetailsModel the model storing the run details state
 * @param {('good'| 'bad' | 'test' | 'none')} runQuality The quality of the run
 * @param {Run} run the run for which run quality must be updated
 * @return {Component} A box with a color corresponding to the quality or '-' when the runQuality is null
 */
export const formatRunQuality = (runDetailsModel, runQuality, run) => {
    if (runDetailsModel.isEditModeEnabled && (run.timeTrgEnd || run.timeO2End)) {
        const ret = [
            h(
                'select',
                {
                    id: '#runQualitySelect',
                    class: 'self-end form-control w-unset',
                    onchange: ({ target }) => runDetailsModel.runPatch.setRunQuality(target.value),
                },
                RUN_QUALITIES.map((quality) => h(
                    `option#run-quality-${quality}`,
                    {
                        value: quality, selected: runDetailsModel.runPatch.runQuality === quality,
                    },
                    quality,
                )),
            ),
        ];
        if (runDetailsModel.runPatch.requireRunQualityChangeReason()) {
            ret.push(h('textarea.form-control.v-resize', {
                placeholder: 'Reason of the detector(s) quality change',
                value: runDetailsModel.runPatch.runQualityChangeReason,
                // eslint-disable-next-line no-return-assign
                oninput: (event) => runDetailsModel.runPatch.runQualityChangeReason = event.target.value,
            }));
        }
        return h('', { class: 'flex-column flex-grow g2' }, ret);
    } else if (runQuality) {
        return h('.badge.white', {
            class: (() => {
                if (runQuality === RunQualities.GOOD) {
                    return 'bg-success';
                } else if (runQuality === RunQualities.BAD) {
                    return 'bg-danger';
                }
                return 'bg-gray-darker';
            })(),
        }, runQuality);
    }
    return '-';
};
