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

/**
 * Modify Run entity lhcPeriod field,
 * if lhcPeriod is an object of type @see LhcPeriod
 * then lhcPeriod becomes lhcPeriod.name
 * @param {Run} run instance
 * @return {Run} run with updated field
 */
exports.convertRunLhcPeriod = (run) => {
    if (!run) {
        return run;
    }
    if (typeof run.lhcPeriod === 'object') {
        run.lhcPeriod = run.lhcPeriod?.name;
    }
    return run;
};

// eslint-disable-next-line require-jsdoc, no-unused-vars
const getTopDownPathsInAdaptersIndex = (adaptersIndex, terminalAdapterName) => {
    const acc = [];
    // eslint-disable-next-line require-jsdoc
    const traversAdaptersIndex = (obj, prefix) =>
        Object.entries(obj ?? {}).filter(([adapterName]) => /Adapter/.test(adapterName))
            .forEach(([adapterName, adapter]) => prefix.includes(adapterName) ?
                null
                : adapterName === terminalAdapterName ?
                    acc.push(prefix.concat([terminalAdapterName]))
                    : traversAdaptersIndex(adapter, prefix.concat([adapterName])));

    traversAdaptersIndex(adaptersIndex, []);
    const finalMapEntries = {};
    acc
        .filter((path) => path.length > 1)
        .map((path) => path.slice(0, 2))
        .map(([a1, a2]) => [a1, { next: a2, field: null }])
        .forEach(([ad, next]) => {
            finalMapEntries[ad] ? finalMapEntries[ad].push(next) : finalMapEntries[ad] = [next];
        });

    return finalMapEntries;
};

// eslint-disable-next-line require-jsdoc
const polimorphiseFromAdapterNames = (conf) => {
    // eslint-disable-next-line require-jsdoc
    const adapterNameToEntityName = (adapterName) => adapterName.replace('Adapter', '');
    Object.keys(conf)
        .filter((adapterName) => /Adapter/.test(adapterName))
        .forEach((adapterName) => {
            conf[adapterNameToEntityName(adapterName)] = conf[adapterName];
        });
    return conf;
};

const adaptersIndexPathsTopDown = {
    dplDetectorAdapter: [{ next: 'dplProcessExecutionAdapter', field: 'processesExecutions' }],
    dplProcessExecutionAdapter: [{ next: 'runAdapter', field: 'run' }],
    dplProcessAdapter: [{ next: 'dplProcessExecutionAdapter', field: 'processesExecutions' }],
    environmentAdapter: [{ next: 'runAdapter', field: 'runs' }],
    flpRoleAdapter: [{ next: 'runAdapter', field: 'run' }],
    hostAdapter: [{ next: 'dplProcessExecutionAdapter', field: 'processesExecutions' }],
    lhcFillAdapter: [{ next: 'runAdapter', field: 'runs' }],
    logAdapter: [
        { next: 'runAdapter', field: 'runs' },
        { next: 'environmentAdapter', field: 'environments' },
        { next: 'lhcFillAdapter', field: 'lhcFills' },
    ],
};
polimorphiseFromAdapterNames(adaptersIndexPathsTopDown);

// eslint-disable-next-line require-jsdoc
const secondOrderAdapter = ({ entity, entityTypeIdentifier, terminalTypeIdentifiers, adapterFunction }) => {
    if (Array.isArray(entity)) {
        entity.forEach((subentity) => secondOrderAdapter({
            entity: subentity,
            entityTypeIdentifier,
            terminalTypeIdentifiers,
            adapterFunction,
        }));
    }
    if (entity && terminalTypeIdentifiers.has(entityTypeIdentifier)) {
        adapterFunction(entity);
        return;
    }

    if (entity) {
        for (const nextStep of adaptersIndexPathsTopDown[entityTypeIdentifier]) {
            secondOrderAdapter({
                entity: entity[nextStep.field],
                entityTypeIdentifier: nextStep.next,
                terminalIdnetifiers: terminalTypeIdentifiers,
                adapterFunction,
            });
        }
    }
};

exports.secondOrderAdapter = secondOrderAdapter;

exports.convertNestedRunLhcPeriod = (entity, entityTypeIdentifier) => secondOrderAdapter({
    entity,
    entityTypeIdentifier,
    terminalTypeIdentifiers: new Set(['runAdapter', 'run']),
    adapterFunction: (run) => {
        run.lhcPeriod = run.lhcPeriod?.name;
    },
});
