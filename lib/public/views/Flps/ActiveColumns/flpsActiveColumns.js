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
 * List of active columns for a generic table component
 */
export const flpsActiveColumns = {
    id: {
        name: 'ID',
        visible: false,
        primary: true,
    },
    name: {
        name: 'Name',
        visible: true,
        size: 'cell-s',
    },
    hostname: {
        name: 'Hostname',
        visible: true,
        size: 'cell-s',
    },
    nTimeframes: {
        name: '# of STFs',
        visible: true,
        size: 'cell-m',
        format: (value) => value.toLocaleString(),
    },
    bytesEquipmentReadOut: {
        name: 'Data read out',
        visible: true,
        size: 'cell-m',
        format: (value) => value.toLocaleString(),
    },
    bytesRecordingReadOut: {
        name: 'Data recorded locally',
        visible: true,
        size: 'cell-m',
        format: (value) => value.toLocaleString(),
    },
    bytesFairMQReadOut: {
        name: 'Data sent to StfBuilder',
        visible: true,
        size: 'cell-m',
        format: (value) => value.toLocaleString(),
    },
};
