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
import { PdpBeamType } from '../../../domain/enums/PdpBeamType.js';
import { formatFloat } from '../../../utilities/formatting/formatFloat.js';

/**
 * Display run luminosity values
 *
 * @param {Run} run the runs
 * @param {CtpTriggerCounters[]} ctpTriggerCounters the CTP trigger counters
 * @return {Component} the luminosity values component
 */
export const runLuminosityValuesComponent = (run, ctpTriggerCounters) => {
    const { runDuration, pdpBeamType, triggerEfficiency, triggerAcceptance, crossSection, lhcFill } = run;
    const { collidingBunchesCount } = lhcFill;

    let triggers = null;
    if (pdpBeamType === PdpBeamType.PROTON_PROTON) {
        const ctpTriggerCounter = ctpTriggerCounters.find(({ className }) => className === 'CMTVX-NONE-NOPF-CRU');
        triggers = ctpTriggerCounter?.lmb ?? null;
    } else if (pdpBeamType === PdpBeamType.LEAD_LEAD) {
        const ctpTriggerCounter = ctpTriggerCounters.find(({ className }) => className === 'C1ZNC-B-NOPF-CRU');
        triggers = ctpTriggerCounter?.l1a ?? null;
    }
    const triggerRate = runDuration && triggers !== null ? 1000 * triggers / runDuration : null; // 1000 factor for run in seconds

    const pileUp = triggerRate !== null && collidingBunchesCount
        ? -1 * Math.log(1 - triggerRate / (11245 * collidingBunchesCount))
        : null;

    const integratedLuminosity = triggers !== null && crossSection && triggerEfficiency && triggerAcceptance && pileUp
        ? (triggers / (crossSection * triggerEfficiency * triggerAcceptance)) // eslint-disable-line no-extra-parens
          * (pileUp / (1 - Math.exp(-1 * pileUp)))
        : null;

    return [
        h('.flex-column.items-center.flex-grow', [
            h('strong', 'Integrated lumi'),
            integratedLuminosity
                ? h('', [
                    formatFloat(integratedLuminosity),
                    h('math', h('msup', [h('mi', 'µb'), h('mn', '-1')])),
                ])
                : '-',
        ]),
        h('.flex-column.items-center.flex-grow', [
            h('strong', 'Pile up'),
            h('', formatFloat(pileUp)),
        ]),
        h('.flex-column.items-center.flex-grow', [
            h('strong', 'Cross-Section'),
            h('', crossSection ? `${formatFloat(crossSection)} µb` : '-'),
        ]),
        h('.flex-column.items-center.flex-grow', [
            h('strong', 'Trg eff'),
            h('', formatFloat(triggerEfficiency)),
        ]),
        h('.flex-column.items-center.flex-grow', [
            h('strong', 'Trg acc'),
            h('', formatFloat(triggerAcceptance)),
        ]),
    ];
};
