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

import { RcDailyMeetingTemplate } from './RcDailyMeetingTemplate.js';
import { PanelComponent } from '../../../../components/common/panel/PanelComponent.js';
import { h, RemoteData } from '/js/src/index.js';
import { LabelPanelHeaderComponent } from '../../../../components/common/panel/LabelPanelHeaderComponent.js';
import { markdownInput } from '../../../../components/common/markdown/markdown.js';
import errorAlert from '../../../../components/common/errorAlert.js';
import spinner from '../../../../components/common/spinner.js';
import { formatPercentage } from '../../../../utilities/formatting/formatPercentage.js';
import {
    aliceMagnetsConfigurationsSnapshotsForm,
} from '../../../../components/common/form/magnetsConfiguration/aliceMagnetsConfigurationsSnapshotsForm.js';
import { table } from '../../../../components/common/table/table.js';
import { runsActiveColumns } from '../../../Runs/ActiveColumns/runsActiveColumns.js';
import { createRunDetectorsSyncQcActiveColumns } from '../../../Runs/ActiveColumns/runDetectorsActiveColumns.js';
import { formatTimeAndEfficiencyLoss } from '../../../../utilities/formatting/formatTimeAndEfficiencyLoss.js';

/**
 * On call template configuration
 *
 * @param {LogCreationModel} creationModel the log creation model
 * @param {LogTemplate} template the log creation template
 * @return {Partial<LogCreationFormConfiguration>} the on-call template configuration
 */
export const rcDailyMeetingConfiguration = (creationModel, template) => {
    if (!(template instanceof RcDailyMeetingTemplate)) {
        return {};
    }

    return {
        mainPane: [
            h('h4', 'LHC'),
            h(PanelComponent, [
                h(LabelPanelHeaderComponent, 'Last 24h'),
                template.lhcFills.match({
                    NotAsked: () => null,

                    /**
                     * Display LHC fills ended between noon last day and noon today
                     * @param {LhcFill[]} lhcFills fills to display
                     * @return {Component} the fills display
                     */
                    Success: (lhcFills) => lhcFills.length
                        ? h('ul', lhcFills.map((lhcFill) => h('li', [
                            `Fill ${lhcFill.fillNumber} (${lhcFill.fillingSchemeName})`,
                            h('ul', [
                                h('li', `Beam type: ${lhcFill.beamType}`),
                                h('li', `Stable beam start: ${lhcFill.stableBeamsStart ?? '-'}`),
                                h('li', `Stable beam end: ${lhcFill.stableBeamsEnd ?? '-'}`),
                                h('li', `Duration: ${lhcFill.stableBeamsDuration ?? '-'}`),
                                h('li', `Efficiency: ${formatPercentage(lhcFill.statistics?.efficiency)}`),
                                h('li', `Time to first run: ${formatTimeAndEfficiencyLoss(
                                    lhcFill.statistics?.timeLossAtStart,
                                    lhcFill.statistics?.efficiencyLossAtStart,
                                )}`),
                            ]),
                        ])))
                        : h('em.flex-row.p2', 'No fills'),
                    Failure: (error) => errorAlert(error),
                    Loading: () => spinner({ absolute: false, size: 2 }),
                }),
            ]),
            h(PanelComponent, [
                h(LabelPanelHeaderComponent, 'Plans'),
                markdownInput(
                    template.formData.lhcPlans,
                    {
                        id: 'lhc-plans',
                        onchange: (e) => template.patchFormData({ lhcPlans: e.target.value }),
                        class: 'flex-grow',
                    },
                    { height: '10em' },
                ),
            ]),
            h('h4', 'ALICE'),
            h(PanelComponent, [
                h(LabelPanelHeaderComponent, 'Magnets'),
                h('.flex-column.g3.p3', aliceMagnetsConfigurationsSnapshotsForm(template.magnetsConfigurationModel)),
            ]),
            h(PanelComponent, [
                h(LabelPanelHeaderComponent, 'Plans'),
                markdownInput(
                    template.formData.alicePlans,
                    {
                        id: 'lhc-plans',
                        onchange: (e) => template.patchFormData({ alicePlans: e.target.value }),
                        class: 'flex-grow',
                    },
                    { height: '10em' },
                ),
            ]),
            h('h4', 'Runs to be checked'),
            template.runsToCheck.match({
                NotAsked: () => null,

                /**
                 * Display runs ended between noon last day and noon today
                 * @param {Run[]} runsToCheck runs to display
                 * @return {Component} the runs display
                 */
                Success: (runsToCheck) => runsToCheck.length
                    ? table(
                        runsToCheck,
                        {
                            ...runsActiveColumns,
                            ...createRunDetectorsSyncQcActiveColumns(
                                template.physicalDetectors.match({
                                    Success: (payload) => payload,
                                    Other: () => [],
                                }),
                                { profiles: 'rcTemplate' },
                            ),
                        },
                        {},
                        { profile: 'rcTemplate' },
                    )
                    : h('em.flex-row.p2', 'No runs'),
                Failure: (error) => errorAlert(error),
                Loading: () => spinner({ absolute: false, size: 2 }),
            }),
            h('h4', 'Access'),
            h(PanelComponent, [
                h(LabelPanelHeaderComponent, 'Last 24h'),
                markdownInput(
                    template.formData.alicePlans,
                    {
                        id: 'lhc-plans',
                        onchange: (e) => template.patchFormData({ access: e.target.value }),
                        class: 'flex-grow',
                    },
                    { height: '10em' },
                ),
            ]),
            h('h4', 'Central Systems/Services'),
            h(PanelComponent, [
                h(LabelPanelHeaderComponent, 'Last 24h'),
                template.systemLogs.match({
                    NotAsked: () => null,
                    Success: (logs) => markdownInput(
                        logs,
                        {
                            onchange: (e) => {
                                template.systemsLogs = RemoteData.success(e.target.value);
                            },
                            height: '10em',
                        },
                    ),
                    Failure: (error) => errorAlert(error),
                    Loading: () => spinner({ absolute: false, size: 2 }),
                }),
            ]),
            h('h4', 'Detectors'),
            h(PanelComponent, [
                h(LabelPanelHeaderComponent, 'Last 24h'),
                template.detectorsLogs.match({
                    NotAsked: () => null,
                    Success: (logs) => markdownInput(
                        logs,
                        {
                            onchange: (e) => {
                                template.detectorsLogs = RemoteData.success(e.target.value);
                            },
                            height: '10em',
                        },
                    ),
                    Failure: (error) => errorAlert(error),
                    Loading: () => spinner({ absolute: false, size: 2 }),
                }),
            ]),
            h('h4', 'Pending requests'),
            h(PanelComponent, [
                markdownInput(
                    template.formData.pendingRequests,
                    {
                        id: 'lhc-plans',
                        onchange: (e) => template.patchFormData({ pendingRequests: e.target.value }),
                        class: 'flex-grow',
                    },
                    { height: '10em' },
                ),
            ]),
            h('h4', 'AOB'),
            h(PanelComponent, [
                markdownInput(
                    template.formData.alicePlans,
                    {
                        id: 'lhc-plans',
                        onchange: (e) => template.patchFormData({ aob: e.target.value }),
                        class: 'flex-grow',
                    },
                    { height: '10em' },
                ),
            ]),
        ],
        sidePane: null,
    };
};
