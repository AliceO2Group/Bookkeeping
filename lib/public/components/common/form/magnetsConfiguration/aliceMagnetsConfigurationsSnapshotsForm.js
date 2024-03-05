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
import { h, iconTrash } from '/js/src/index.js';
import { TimestampInputComponent } from '../inputs/TimestampInputComponent.js';

/**
 * Return a component to fill ALICE magnets configuration at a given time
 *
 * @param {AliceMagnetsConfigurationSnapshot} magnetsConfigurationSnapshot the magnets configuration snapshot being edited
 * @return {Component} the resulting component
 */
const aliceMagnetsConfigurationSnapshotForm = (magnetsConfigurationSnapshot) => h('.flex-row.items-center.g2', [
    h(TimestampInputComponent, {
        seconds: true,
        onChange: (timestamp) => {
            magnetsConfigurationSnapshot.timestamp = timestamp;
        },
    }),
    h('', '-'),
    aliceMagnetsConfigurationForm(magnetsConfigurationSnapshot.magnetsConfiguration),
]);

/**
 * Return a component to fill ALICE magnets configuration
 *
 * @param {AliceMagnetsConfiguration} magnetsConfiguration the magnet configuration model
 * @return {Component} the magnet configuration form
 */
export const aliceMagnetsConfigurationForm = (magnetsConfiguration) => [
    h('', 'Solenoid'),
    h(
        'input.form-control.w-unset',
        {
            value: magnetsConfiguration.solenoid,
            // eslint-disable-next-line no-return-assign
            oninput: (e) => magnetsConfiguration.solenoid = e.target.value,
        },
    ),
    h('', '-'),
    h('', 'Dipole'),
    h(
        'input.form-control.w-unset',
        {
            value: magnetsConfiguration.dipole,
            // eslint-disable-next-line no-return-assign
            oninput: (e) => magnetsConfiguration.dipole = e.target.value,
        },
    ),
];

/**
 * Component to fill sequential timestamped snapshots of ALICE magnets configuration
 *
 * @param {AliceMagnetsConfigurationSnapshotsFormModel} configurationSnapshotsFormModel the form model
 * @return {Component} the form component
 */
export const aliceMagnetsConfigurationsSnapshotsForm = (configurationSnapshotsFormModel) => {
    const entries = Object.entries(configurationSnapshotsFormModel.allSnapshots)
        .filter(([, value]) => value !== null);
    entries.sort((
        [, { timestamp: a }],
        [, { timestamp: b }],
    ) => (a || Infinity) - (b || Infinity));

    return [
        entries.map(([key, magnetsConfigurationSnapshot]) => h(
            `#magnets-${key}.flex-row.items-center.g2`,
            {
                key,
            },
            [
                aliceMagnetsConfigurationSnapshotForm(magnetsConfigurationSnapshot),
                // eslint-disable-next-line no-return-assign
                h('.btn.btn-danger', { onclick: () => configurationSnapshotsFormModel.dropSnapshot(Number(key)) }, iconTrash()),
            ],
        )),
        h('.flex-row.items-center.g2', [
            h(
                '#magnets-add.button.btn.btn-primary',
                {
                    onclick: () => configurationSnapshotsFormModel.addSnapshot(),
                },
                'Add',
            ),
        ]),
    ];
};
