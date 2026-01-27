import { h } from '/js/src/index.js';
import { breadcrumbs } from '../common/navigation/breadcrumbs.js';
import { frontLink } from '../common/navigation/frontLink.js';
import { RunQualities } from '../../domain/enums/RunQualities.js';

/**
 * Render QC flag(-s) breadcrumbs
 *
 * @param {object} qcBreadcrumbsElements breadcrumbs elements
 * @param {DataPass} [qcBreadcrumbsElements.dataPass] data pass -- exclusive with `remoteSimulationPass`
 * @param {SimulationPass} [qcBreadcrumbsElements.simulationPass] simulation pass -- exclusive with `remoteDataPass`
 * @param {Run} qcBreadcrumbsElements.run run
 * @param {Detector} [qcBreadcrumbsElements.detector] dpl detector
 * @param {string} [header = 'QC'] header text
 * @return {Component} breadcrumbs
 */
export const qcFlagsBreadcrumbs = ({ dataPass, simulationPass, run, detector }, header = 'QC') => {
    if (dataPass && simulationPass) {
        throw new Error('`dataPass` and `simulationPass` are exclusive options');
    }

    const breadcrumbsItems = [h('h2#breadcrumb-header', header)];

    if (dataPass) {
        breadcrumbsItems.push(h('h2#breadcrumb-data-pass-name', frontLink(dataPass.name, 'runs-per-data-pass', { dataPassId: dataPass.id })));
    }
    if (simulationPass) {
        breadcrumbsItems.push(h(
            'h2#breadcrumb-simulation-pass-name',
            frontLink(simulationPass.name, 'runs-per-simulation-pass', { simulationPassId: simulationPass.id }),
        ));
    }

    breadcrumbsItems.push(h(
        `h2#breadcrumb-run-number${run.runQuality === RunQualities.BAD ? '.danger' : ''}`,
        frontLink(run.runNumber, 'run-detail', { runNumber: run.runNumber }),
    ));

    if (detector) {
        breadcrumbsItems.push(h('h2#breadcrumb-detector-name', detector.name));
    }

    return breadcrumbs(breadcrumbsItems);
};
