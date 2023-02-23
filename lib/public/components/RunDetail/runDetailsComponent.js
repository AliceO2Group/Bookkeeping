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

import { detailsList } from '../Detail/detailsList.js';
import { h, iconTrash, iconPlus } from '/js/src/index.js';
import { formatTimestamp } from '../../utilities/formatting/formatTimestamp.js';
import { formatBoolean } from '../../utilities/formatting/formatBoolean.js';
import { formatRunDuration } from '../../views/Runs/format/formatRunDuration.js';
import { formatRunType } from '../../utilities/formatting/formatRunType.js';
import { dropdown } from '../common/popover/dropdown.js';
import { iconCheck, iconX } from '/js/src/icons.js';
import { RUN_QUALITIES, RunQualities } from '../../domain/enums/RunQualities.js';
import { RUN_DETECTOR_QUALITIES, RunDetectorQualities } from '../../domain/enums/RunDetectorQualities.js';
import { frontLink } from '../common/navigation/frontLink.js';

/**
 * A singular detail page which provides information about a run
 *
 * @param {RunDetailsModel} runDetailsModel the model storing the run details state
 * @param {Run} run all data related to the run
 * @return {Component} the run's display page
 */
export const runDetailsComponent = (runDetailsModel, run) => detailsList(activeFields(runDetailsModel), run, 'Run', '-');

/**
 * Method to retrieve the information for a specific run
 * @param {RunDetailsModel} runDetailsModel the model storing the run details state
 * @return {Object} A collection of data with parameters for the Run detail page.
 */
const activeFields = (runDetailsModel) => ({
    detectors: {
        name: 'Detectors',
        visible: true,
        size: 'cell-m',
        format: (_, run) => formatRunDetectors(run, runDetailsModel),
    },
    tags: {
        name: 'Tags',
        visible: true,
        size: 'cell-l',
        format: (tags) => tags && tags.length > 0 ? tags.map(({ text }) => text).join(', ') : '-',
    },
    timeO2Start: {
        name: 'O2 Start',
        visible: true,
        size: 'cell-l',
        format: (timestamp) => formatTimestamp(timestamp),
    },
    timeO2End: {
        name: 'O2 Stop',
        visible: true,
        size: 'cell-l',
        format: (timestamp) => formatTimestamp(timestamp),
    },
    timeTrgStart: {
        name: 'TRG Start',
        visible: true,
        size: 'cell-l',
        format: (timestamp) => formatTimestamp(timestamp),
    },
    timeTrgEnd: {
        name: 'TRG Stop',
        visible: true,
        size: 'cell-l',
        format: (timestamp) => formatTimestamp(timestamp),
    },
    runDuration: {
        name: 'Run Duration',
        visible: true,
        size: 'cell-l',
        format: (_duration, run) =>
            h('#runDurationValue', formatRunDuration(run)),
    },
    environmentId: {
        name: 'Environment Id',
        visible: true,
        size: 'cell-m',
        format: (id) => id ? frontLink(id, 'env-details', { environmentId: id }) : '-',
    },
    runQuality: {
        name: 'Run Quality',
        visible: true,
        size: 'cell-m',
        format: (runQuality, run) => formatRunQuality(runDetailsModel, runQuality, run),
    },
    definition: {
        name: 'Definition',
        visible: true,
        size: 'cell-m',
        format: (definition) => definition || '-',
    },
    runType: {
        name: 'Run Type',
        visible: true,
        size: 'cell-m',
        format: formatRunType,
    },
    nDetectors: {
        name: 'Number of Detectors',
        visible: true,
        size: 'cell-m',
    },
    nEpns: {
        name: 'Number of EPNs',
        visible: true,
        size: 'cell-s',
    },
    nFlps: {
        name: 'Number of FLPs',
        visible: true,
        size: 'cell-s',
    },
    triggerValue: {
        name: 'Trigger Value',
        size: 'cell-s',
        visible: true,
    },
    pdpConfigOption: {
        name: 'PDP Configuration Option',
        visible: true,
    },
    pdpTopologyDescriptionLibraryFile: {
        name: 'PDP Topology Description Library File',
    },
    pdpWorkflowParameters: {
        name: 'PDP Workflow Parameters',
        visible: true,
        size: 'cell-m',
    },
    pdpBeamType: {
        name: 'PDP Beam Type',
        visible: true,
        size: 'cell-m',
    },
    tfbDdMode: {
        name: 'TFB DD Mode',
        visible: true,
    },
    dd_flp: {
        name: 'Data Distribution (FLP)',
        visible: true,
        size: 'cell-s',
        format: formatBoolean,
    },
    dcs: {
        name: 'DCS',
        visible: true,
        size: 'cell-s',
        format: formatBoolean,
    },
    epn: {
        name: 'EPN',
        visible: true,
        size: 'cell-s',
        format: formatBoolean,
    },
    epnTopology: {
        name: 'Topology',
        visible: true,
        size: 'cell-m',
    },
    odcTopologyFullName: {
        name: 'Topology Full Name',
        visible: true,
        size: 'cell-m',
    },
    readoutCfgUri: {
        name: 'Readout Config URI',
        visible: true,
        size: 'cell-m',
    },
    startOfDataTransfer: {
        name: 'Start of Data Transfer',
        visible: true,
        format: formatTimestamp,

    },
    endOfDataTransfer: {
        name: 'End of Data Transfer',
        visible: true,
        format: formatTimestamp,

    },
    ctfFileCount: {
        name: 'Ctf File Count',
        visible: true,
    },
    ctfFileSize: {
        name: 'Ctf File Size',
        visible: true,
        format: (fileSize) => fileSize !== null
            ? `${fileSize} byte(s)`
            : '-',
    },
    tfFileCount: {
        name: 'Tf File Count',
        visible: true,
    },
    tfFileSize: {
        name: 'Tf File Size',
        visible: true,
        format: (fileSize) => fileSize !== null
            ? `${fileSize} byte(s)`
            : '-',
    },
    otherFileCount: {
        name: 'Other File Count',
        visible: true,
    },
    otherFileSize: {
        name: 'Other File Size',
        visible: false,
        format: (fileSize) => fileSize !== null
            ? `${fileSize} byte(s)`
            : '-',
    },
    eorReasons: {
        name: 'EOR Reasons',
        visible: true,
        size: 'cell-m',
        format: (eorReasons) => formatEorReasonsCell(runDetailsModel, eorReasons),
    },
});

/**
 * Build a table cell with formatted cells. If editMode is:
 * * enabled: build widgets to allow user to remove existing reasons or add new ones
 * * disabled: display current eorReasons
 * @param {RunDetailsModel} runDetailsModel the model storing the run details state
 * @param {Array<object>} eorReasons - List of eor reasons for a particular run
 * @returns {Component} Return a formatted cell for eorReasons
 */
const formatEorReasonsCell = (runDetailsModel, eorReasons) => {
    if (!runDetailsModel.isEditModeEnabled) {
        return h('.w-80.flex-column.items-end', [
            eorReasons.map(({ category, title, description }) => {
                const titleString = title ? ` - ${title}` : '';
                const descriptionString = description ? ` - ${description}` : '';
                return h('w-wrapped', `${category} ${titleString} ${descriptionString}`);
            }),
        ]);
    }
    const { reasonTypes } = runDetailsModel;
    const reasonTypeCategories = [];
    if (reasonTypes.isSuccess()) {
        reasonTypes.payload.map((reason) => reason.category).forEach((category) => {
            if (!reasonTypeCategories.includes(category)) {
                reasonTypeCategories.push(category);
            }
        });
    }
    return h('.w-80.flex-column.items-end', [
        reasonTypes.isSuccess() && h('.flex-row', [
            h('select.w-30.form-control', {
                onchange: ({ target }) => {
                    runDetailsModel.eorNewReason.category = target.value;
                    runDetailsModel.eorNewReason.title = '';
                    runDetailsModel.notify();
                },
            }, [
                h('option', { disabled: true, selected: runDetailsModel.eorNewReason.category === '', value: '' }, '-'),
                reasonTypeCategories.map((category, index) => h(`option#eorCategory${index}`, {
                    value: category,
                }, category)),
            ]),
            h('select.w-30.form-control', {
                onchange: ({ target }) => {
                    runDetailsModel.eorNewReason.title = target.value;
                    runDetailsModel.notify();
                },
            }, [
                h('option', { disabled: true, selected: runDetailsModel.eorNewReason.title === '', value: '' }, '-'),
                reasonTypes.payload.filter((reason) => reason.category === runDetailsModel.eorNewReason.category)
                    .map((reason, index) => h(`option#eorTitle${index}`, {
                        value: reason.title,
                    }, reason.title || '(empty)')),
            ]),
            h('input.w-40.form-control', {
                placeholder: 'Description',
                type: 'text',
                oninput: ({ target }) => {
                    runDetailsModel.eorNewReason.description = target.value;
                    runDetailsModel.notify();
                },
            }),
            h('label.ph1.actionable-icon', {
                onclick: () => runDetailsModel.addEorReasonChange(),
            }, iconPlus()),
        ]),
        eorReasons.map(({ id, category, title, description }) => {
            const titleString = title ? ` - ${title}` : '';
            const descriptionString = description ? ` - ${description}` : '';
            return h('.flex-row', [
                h('w-wrapped', `${category} ${titleString} ${descriptionString}`),
                h(`label.danger.ph1.actionable-icon#trashReason${id}`, {
                    onclick: () => {
                        const currentEorReasons = runDetailsModel.runChanges.eorReasons;
                        const index = currentEorReasons.findIndex((eorReason) => eorReason.id === id);
                        currentEorReasons.splice(index, 1);
                        runDetailsModel.runChanges = { key: 'eorReasons', value: currentEorReasons };
                        runDetailsModel.notify();
                    },
                }, iconTrash()),
            ]);
        }),
    ]);
};

/**
 * Formatting for the run quality.
 *
 * @param {RunDetailsModel} runDetailsModel the model storing the run details state
 * @param {('good'| 'bad' | 'test' | 'none')} runQuality The quality of the run
 * @param {Run} run the run for which run quality must be updated
 * @return {Component} A box with a color corresponding to the quality or '-' when the runQuality is null
 */
const formatRunQuality = (runDetailsModel, runQuality, run) => {
    if (runDetailsModel.isEditModeEnabled && (run.timeTrgEnd || run.timeO2End)) {
        return [
            h(
                'select.form-control.w-15#runQualitySelect',
                {
                    onchange: ({ target }) => {
                        runDetailsModel.runChanges = { key: 'runQuality', value: target.value };
                    },
                },
                RUN_QUALITIES.map((quality) => h(
                    `option#run-quality-${quality}`,
                    {
                        value: quality, selected: runDetailsModel.run.payload.runQuality === quality,
                    },
                    quality,
                )),
            ),
        ];
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

/**
 * Format a list of detectors
 *
 * @param {Run} run the run for which detectors must be formatted
 * @param {RunDetailsModel} detailsModel the run details model
 * @return {Component} the formatted run detectors
 */
const formatRunDetectors = (run, detailsModel) => {
    const { detectorsQualities } = run;
    if (!detectorsQualities || detectorsQualities.length === 0) {
        return '-';
    }

    const detectorsBadges = h(
        '.g2.flex-row.flex-grow.flex-wrap.justify-end',
        detectorsQualities.map(({ id, name, quality }) => {
            const actualQuality = detailsModel.isEditModeEnabled
                ? detailsModel.getEditionRunDetectorQuality(id) || quality
                : quality;
            const qualityIsBad = actualQuality === RunDetectorQualities.BAD;
            const color = qualityIsBad ? 'danger' : 'success';
            return h(
                `span.detector-badge.flex-row.justify-center.lh1.g1.br2.pv1.ph2.b1.b-${color}.${color}`,
                { style: 'flex-basis: 5rem;' },
                [h('.detector-name', name), h('.detector-quality-icon', qualityIsBad ? iconX() : iconCheck())],
            );
        }),
    );

    if (detailsModel.isEditModeEnabled && (run.timeTrgEnd || run.timeO2End)) {
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
                                            checked: (detailsModel.getEditionRunDetectorQuality(id) || quality) === qualityOption.toLowerCase(),
                                            name: `detector-quality-${id}`,
                                            onchange: () => {
                                                detailsModel.setEditionRunDetectorQuality(id, qualityOption.toLowerCase());
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

export default runDetailsComponent;
