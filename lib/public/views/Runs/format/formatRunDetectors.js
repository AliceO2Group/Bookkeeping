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
import { RUN_DETECTOR_QUALITIES, RunDetectorQualities } from '../../../domain/enums/RunDetectorQualities.js';
import { dropdown } from '../../../components/common/popover/dropdown.js';
import { iconCheck, iconX, iconBan } from '/js/src/icons.js';

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

    const _detectorTypes = detailsModel.detectorTypes.match({
        NotAsked: () => [],
        Loading: () => [],
        Success: (data) => data,
        Failure: (error) => error
    })

    const _allAndSelectedDetectorTypes = _detectorTypes.map(({id, name}) => {
        const isPresent = detectorsQualities.map(obj => obj.id).includes(id);
        const quality = isPresent ? detectorsQualities.filter(obj => obj.id == id)[0].quality : null
        return {id, name, quality, isPresent}
    })

    const detectorsBadges = h(
        '.g2.flex-row.flex-grow.flex-wrap.justify-end',
        _allAndSelectedDetectorTypes.map(({id, name, quality, isPresent}) => {
            const actualQuality = detailsModel.isEditModeEnabled
                ? detailsModel.runPatch.getDetectorQuality(id) || quality
                : quality;
            let color;
            let icon;
            switch(actualQuality) {
                case RunDetectorQualities.GOOD:
                    color = 'success';
                    icon = iconCheck();
                    break;
                case RunDetectorQualities.BAD:
                    color = 'danger';
                    icon = iconX();
                    break;
                default:
                    color = 'gray';
                    icon = iconBan()
                    break;
            }
            return h(
                `span.detector-badge.flex-row.justify-center.lh1.g1.br2.pv1.ph2.b1.b-${color}.${color}${isPresent ? '.isPresent' : ''}`,
                { style: 'flex-basis: 5rem;' },
                [h('.detector-name', name), h('.detector-quality-icon', icon)],
            );
        })
    )

    if (detailsModel.isEditModeEnabled && (run.timeTrgEnd || run.timeO2End)) {
        detectorsBadges.children = detectorsBadges.children.filter(
            elem => elem.attrs.className.includes('isPresent')
        )
        console.log(detectorsQualities)
        return h(
            '',
            dropdown(
                detailsModel.editionDetectorsDropdownModel,
                detectorsBadges,
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
                                            checked: (detailsModel.runPatch.getDetectorQuality(id) || quality) === qualityOption.toLowerCase(),
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
        );
    }
    return detectorsBadges;
};
