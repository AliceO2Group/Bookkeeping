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

import { h } from '@aliceo2/web-ui/Frontend/js/src/index.js';
import { RUN_DETECTOR_QUALITIES, RunDetectorQualities } from '../../../domain/enums/RunDetectorQualities.js';
import { dropdown } from '../../../components/common/popover/dropdown.js';
import { iconCheck, iconX, iconBan } from '@aliceo2/web-ui/Frontend/js/src/index.js';

/**
 * Format a list of detectors
 *
 * @param {Run} run the run for which detectors must be formatted
 * @param {RunDetailsModel} detailsModel the run details model
 * @return {Component} the formatted run detectors
 */
export const formatRunDetectors = (run, detailsModel) => {
    const { detectorsQualities } = run;
    if (!detectorsQualities || detectorsQualities.length === 0) {
        return '-';
    }

    /**
     * Creates a component containing the detector badges
     *
     * @param {RunDetectorQuality[]} detectors list of detectors
     * @return {Component} the detector badges
     */
    const detectorsBadges = (detectors) =>
        h(
            '',
            { class: 'g2 flex-row flex-grow flex-wrap justify-end' },
            detectors.map(({ id, name }) => {
                let color;
                let icon;
                const detector = detectorsQualities.find((x) => x.id === id);
                if (detector) {
                    const quality = detector.quality || null;
                    const actualQuality = detailsModel.isEditModeEnabled
                        ? detailsModel.runPatch.getDetectorQuality(id) || quality
                        : quality;
                    switch (actualQuality) {
                        case RunDetectorQualities.GOOD:
                            color = 'success';
                            icon = iconCheck();
                            break;
                        case RunDetectorQualities.BAD:
                            color = 'danger';
                            icon = iconX();
                            break;
                        default:
                            color = 'gray-darker';
                            icon = iconBan();
                            break;
                    }
                } else {
                    color = 'gray';
                    icon = iconBan();
                }
                return h(
                    `span.detector-badge.flex-row.justify-center.lh1.g1.br2.pv1.ph2.b1.b-${color}.${color}`,
                    { style: 'flex-basis: 5rem;' },
                    [h('.detector-name', name), h('.detector-quality-icon', icon)],
                );
            }),
        );

    return detailsModel.allDetectors.match({
        NotAsked: () => [],
        Loading: () => [],
        Success: (allDetectors) => {
            if (detailsModel.isEditModeEnabled && (run.timeTrgEnd || run.timeO2End)) {
                const ret = [
                    h(
                        '.self-end',
                        dropdown(
                            h(
                                '.dropdown-trigger.form-control',
                                [
                                    h('.flex-grow', detectorsBadges(detectorsQualities)),
                                    h('.dropdown-trigger-symbol', ''),
                                ],
                            ),
                            h(
                                '.scroll-y',
                                detectorsQualities.map(({ id, name, quality }) => h(
                                    '.flex-row.justify-between.g4.p2',
                                    [
                                        name,
                                        h(
                                            '.flex-row.g2.items-center',
                                            RUN_DETECTOR_QUALITIES.map((qualityOption) => h('label.form-check-label.flex-row.g2', [
                                                h(
                                                    `input#detector-quality-${id}-${qualityOption.toLowerCase()}`,
                                                    {
                                                        type: 'radio',
                                                        checked: (detailsModel.runPatch.getDetectorQuality(id)
                                                            || quality) === qualityOption.toLowerCase(),
                                                        name: `detector-quality-${id}`,
                                                        onchange: () => {
                                                            detailsModel.runPatch.setDetectorQuality(id, qualityOption.toLowerCase());
                                                        },
                                                    },
                                                ),
                                                qualityOption,
                                            ])),
                                        ),
                                    ],
                                )),
                            ),
                            { alignment: 'right' },
                        ),
                    ),
                ];
                if (detailsModel.runPatch.hasAnyDetectorsQualityChange()) {
                    ret.push(h('textarea.form-control.v-resize', {
                        placeholder: 'Reason of the detector(s) quality change',
                        value: detailsModel.runPatch.detectorsQualityChangeReason,
                        // eslint-disable-next-line no-return-assign
                        oninput: (event) => detailsModel.runPatch.detectorsQualityChangeReason = event.target.value,
                    }));
                }
                return h('', { class: 'flex-column flex-grow g2' }, ret);
            } else {
                return detectorsBadges(allDetectors);
            }
        },
        Failure: (error) => error,
    });
};
