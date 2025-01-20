import { h, iconWarning } from '/js/src/index.js';
import { breadcrumbs } from '../common/navigation/breadcrumbs.js';
import { tooltip } from '../common/popover/tooltip.js';
import { frontLink } from '../common/navigation/frontLink.js';
import { RunQualities } from '../../domain/enums/RunQualities.js';
import spinner from '../common/spinner.js';

/**
 * Render QC flag(-s) breadcrumbs
 *
 * @param {object} qcBreadcrumbsElements breadcrumbs elements
 * @param {Run} qcBreadcrumbsElements.remoteRun run remote data
 * @param {number} [qcBreadcrumbsElements.remoteDataPass] data pass remote data -- exclusive with `remoteSimulationPass`
 * @param {object} [qcBreadcrumbsElements.remoteSimulationPass] simulation pass remote data -- exclusive with `remoteDataPass`
 * @param {number} qcBreadcrumbsElements.remoteDplDetector dpl detector remote data
 * @param {string} [header = 'QC'] header text
 * @return {Component} breadcrumbs
 */
export const qcFlagsBreadcrumbs = ({ remoteDataPass, remoteSimulationPass, remoteRun, remoteDplDetector }, header = 'QC') => {
    if (remoteDataPass && remoteSimulationPass) {
        throw new Error('`remoteDataPass` and `remoteSimulationPass` are exclusive options');
    }

    return breadcrumbs([
        h('h2#breadcrumb-header', header),
        remoteDataPass?.match({
            Success: ({ id, name }) => h('h2#breadcrumb-data-pass-name', frontLink(name, 'runs-per-data-pass', { dataPassId: id })),
            Failure: () => tooltip(h('.f3', iconWarning()), 'Not able to load data pass info'),
            Loading: () => h('', spinner({ size: 2, absolute: false })),
            NotAsked: () => tooltip(h('.f3', iconWarning()), 'No data pass data was asked for'),
        }),
        remoteSimulationPass?.match({
            Success: ({ id, name }) => h(
                'h2#breadcrumb-simulation-pass-name',
                frontLink(name, 'runs-per-simulation-pass', { simulationPassId: id }),
            ),
            Failure: () => tooltip(h('.f3', iconWarning()), 'Not able to load simulation pass info'),
            Loading: () => h('', spinner({ size: 2, absolute: false })),
            NotAsked: () => tooltip(h('.f3', iconWarning()), 'No simulation pass data was asked for'),
        }),
        remoteRun && remoteRun.match({
            Success: ({ runNumber, runQuality }) => runQuality === RunQualities.BAD
                ? h('h2.danger', frontLink(runNumber, 'run-detail', { runNumber }))
                : h('h2', frontLink(runNumber, 'run-detail', { runNumber })),
            Failure: () => tooltip(h('.f3', iconWarning()), 'Not able to load run info'),
            Loading: () => h('', spinner({ size: 2, absolute: false })),
            NotAsked: () => tooltip(h('.f3', iconWarning()), 'No run data was asked for'),
        }),
        remoteDplDetector?.match({
            Success: (dplDetector) => h('h2#breadcrumb-detector-name', dplDetector.name),
            Failure: () => tooltip(h('.f3', iconWarning()), 'Not able to load detector info'),
            Loading: () => h('', spinner({ size: 2, absolute: false })),
            NotAsked: () => tooltip(h('.f3', iconWarning()), 'No detector data was asked for'),
        }),
    ]);
};
