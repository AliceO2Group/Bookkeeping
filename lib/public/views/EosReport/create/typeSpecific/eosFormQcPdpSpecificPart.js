/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

import { h } from '/js/src/index.js';
import { frontLink } from '../../../../components/common/navigation/frontLink.js';
import { formatRunDuration } from '../../../../utilities/formatting/formatRunDuration.mjs';
import { commentInput } from './commentInput.js';
import { RunDetectorQualities } from '../../../../domain/enums/RunDetectorQualities.js';
import { eosReportEorReasonsList } from './eosReportEorReasonsList.js';
import { eosReportLogsList } from './eosReportLogsList.js';

/**
 * Runs are grouped by definition, and all the runs for a given definition are displayed together in what is named a panel
 *
 * @param {string} definition the panel's run definition
 * @param {Run[]} runs the panel's runs
 * @param {object} runComments the object containing runs comments
 * @return {Component} the resulting component
 */
const formatDefinitionPanel = (definition, runs, runComments) => [
    h('h3', definition),
    h('ul.mv1', runs.map((run) => {
        const badQualityDetectorsNames = [];
        const detectorsNames = [];
        for (const { name, quality } of run.detectorsQualities) {
            detectorsNames.push(name);
            if (quality === RunDetectorQualities.BAD) {
                badQualityDetectorsNames.push(name);
            }
        }
        return h(
            'li.mv1',
            h('.flex-row.g2', [
                h('a', frontLink(`#${run.runNumber}`, 'run-detail', { id: run.id }, { onclick: () => true, target: '_blank' })),
                h('', '-'),
                h('', formatRunDuration(run)),
                h('', '-'),
                h('', run.runQuality),
            ]),
            h('ul', [
                h('li', `Detectors: ${detectorsNames.length > 0 ? detectorsNames.join(',') : '-'}`),
                h('li', `Detectors QC bad: ${badQualityDetectorsNames.length > 0 ? badQualityDetectorsNames.join(',') : '-'}`),
                eosReportEorReasonsList(run.eorReasons),
                eosReportLogsList(run.logs),
                commentInput(runComments[run.runNumber], (value) => {
                    runComments[run.runNumber] = value;
                }),
            ]),
        );
    })),
];

/**
 * Generates the EoS report form part specific to ECS report
 *
 * @param {object} formData the creation model's form current data
 * @param {object} shiftData the auto-generated shift data
 * @return {Component} the QC/PDP form specific part
 */
export const eosFormQcPdpSpecificPart = (formData, { typeSpecific }) => {
    const runsByDefinition = Object.entries(typeSpecific.runs);
    return h('#type-specific.panel', [
        h('.panel-header', 'Runs'),
        runsByDefinition.length > 0
            ? runsByDefinition.map(([definition, runs]) => h(
                '.p2.pv3.flex-grow',
                formatDefinitionPanel(definition, runs, formData.typeSpecific.runComments),
            ))
            : h('.p2.pv2', '-'),
    ]);
};
