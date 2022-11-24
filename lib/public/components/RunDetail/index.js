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
import { formatRunDuration } from '../../views/Runs/formatRunDuration.js';
import { formatRunType } from '../../utilities/formatting/formatRunType.js';
import { popover } from '../common/popover/popover.js';
import { dropdown } from '../common/popover/dropdown.js';

/**
 * Method to retrieve the information for a specific run
 * @param {Model} model Pass the model to access the defined functions.
 * @return {Object} A collection of data with parameters for the Run detail page.
 */
const activeFields = (model) => ({
    detectors: {
        name: 'Detectors',
        visible: true,
        size: 'cell-m',
        format: (_, run) => formatRunDetectors(run, model.runs.detailsModel),
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
            h(
                '#runDurationValue',
                popover(formatRunDuration(run), [
                    h('.w-100', 'When having * the value is calculated based on "o2_stop" - "o2_start"'),
                    h('.w-100', 'When having ** the value is calculated based on a combination of trigger and o2 times'),
                ]),
            ),
    },
    environmentId: {
        name: 'Environment Id',
        visible: true,
        size: 'cell-m',
    },
    runQuality: {
        name: 'Run Quality',
        visible: true,
        size: 'cell-m',
        format: (runQuality, run) => formatRunQuality(model, runQuality, run),
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
        format: (eorReasons) => formatEorReasonsCell(model, eorReasons),
    },
});

/**
 * A singular detail page which provides information about a run
 *
 * @param {Object} model Pass the model to access the defined functions.
 * @param {Object} post all data related to the post
 * @return {vnode} Returns a post
 */
const entry = (model, post) => {
    const postFields = activeFields(model);
    return detailsList(postFields, post, 'Run', '-');
};

/**
 * Build a table cell with formatted cells. If editMode is:
 * * enabled: build widgets to allow user to remove existing reasons or add new ones
 * * disabled: display current eorReasons
 * @param {Model} model Pass the model to access the defined functions
 * @param {Array<JSON>} eorReasons - List of eor reasons for a particular run
 * @returns {vnode} Return a formatted cell for eorReasons
 */
const formatEorReasonsCell = (model, eorReasons) => {
    if (!model.runs.detailsModel.isEditModeEnabled) {
        return h('.w-80.flex-column.items-end', [
            eorReasons.map(({ category, title, description }) => {
                const titleString = title ? ` - ${title}` : '';
                const descriptionString = description ? ` - ${description}` : '';
                return h('w-wrapped', `${category} ${titleString} ${descriptionString}`);
            }),
        ]);
    }
    const { reasonTypes } = model.runs.detailsModel;
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
                    model.runs.detailsModel.eorNewReason.category = target.value;
                    model.runs.detailsModel.eorNewReason.title = '';
                    model.runs.notify();
                },
            }, [
                h('option', { disabled: true, selected: model.runs.detailsModel.eorNewReason.category === '', value: '' }, '-'),
                reasonTypeCategories.map((category, index) => h(`option#eorCategory${index}`, {
                    value: category,
                }, category)),
            ]),
            h('select.w-30.form-control', {
                onchange: ({ target }) => {
                    model.runs.detailsModel.eorNewReason.title = target.value;
                    model.runs.notify();
                },
            }, [
                h('option', { disabled: true, selected: model.runs.detailsModel.eorNewReason.title === '', value: '' }, '-'),
                reasonTypes.payload.filter((reason) => reason.category === model.runs.detailsModel.eorNewReason.category)
                    .map((reason, index) => h(`option#eorTitle${index}`, {
                        value: reason.title,
                    }, reason.title || '(empty)')),
            ]),
            h('input.w-40.form-control', {
                placeholder: 'Description',
                type: 'text',
                oninput: ({ target }) => {
                    model.runs.detailsModel.eorNewReason.description = target.value;
                    model.runs.notify();
                },
            }),
            h('label.ph1.actionable-icon', {
                onclick: () => model.runs.detailsModel.addEorReasonChange(),
            }, iconPlus()),
        ]),
        eorReasons.map(({ id, category, title, description }) => {
            const titleString = title ? ` - ${title}` : '';
            const descriptionString = description ? ` - ${description}` : '';
            return h('.flex-row', [
                h('w-wrapped', `${category} ${titleString} ${descriptionString}`),
                h(`label.danger.ph1.actionable-icon#trashReason${id}`, {
                    onclick: () => {
                        const currentEorReasons = model.runs.detailsModel.runChanges.eorReasons;
                        const index = currentEorReasons.findIndex((eorReason) => eorReason.id === id);
                        currentEorReasons.splice(index, 1);
                        model.runs.detailsModel.runChanges = { key: 'eorReasons', value: currentEorReasons };
                        model.runs.notify();
                    },
                }, iconTrash()),
            ]);
        }),
    ]);
};

/**
 * Formatting for the run quality.
 *
 * @param {Model} model The general model object
 * @param {('good'| 'bad' | 'test' | null)} runQuality The quality of the run
 * @param {Run} run the run for which run quality must be updated
 * @return {Vnode | String} A box with a color corresponding to the quality or '-' when the runQuality is null
 */
const formatRunQuality = (model, runQuality, run) => {
    if (model.runs.detailsModel.isEditModeEnabled && (run.timeTrgEnd || run.timeO2End)) {
        return [
            h('select.form-control.w-15#runQualitySelect', {
                onchange: ({ target }) => {
                    model.runs.detailsModel.runChanges = { key: 'runQuality', value: target.value };
                },
            }, [
                h('option#runQualityGood', {
                    value: 'good', selected: model.runs.detailsModel.run.payload.runQuality === 'good',
                }, 'good'),
                h('option#runQualityBad', {
                    value: 'bad', selected: model.runs.detailsModel.run.payload.runQuality === 'bad',
                }, 'bad'),
                h('option#runQualityTest', {
                    value: 'test', selected: model.runs.detailsModel.run.payload.runQuality === 'test',
                }, 'test'),
            ]),
        ];
    } else if (runQuality) {
        return h('.badge.white', {
            class: (() => {
                if (runQuality === 'good') {
                    return 'bg-success';
                } else if (runQuality === 'bad') {
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
        '.g1.flex-row.flex-wrap.justify-end',
        detectorsQualities.map(({ id, name, quality }) => {
            const actualQuality = detailsModel.isEditModeEnabled
                ? detailsModel.getEditionRunDetectorQuality(id) || quality
                : quality;
            const color = actualQuality === 'bad' ? 'danger' : 'success';
            return h(
                `small.badge.b1.b-${color}.${color}`,
                name,
            );
        }),
    );

    if (detailsModel.isEditModeEnabled) {
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
                                ['Good', 'Bad'].map((qualityOption) => h('label.form-check-label.flex-row.g2', [
                                    h(
                                        `input#detector-quality-${id}`,
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

export default entry;
