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

import { h } from '/js/src/index.js';
import { frontLink } from '../common/navigation/frontLink.js';

/**
 * A collection of fields to show per flp detail, optionally with special formatting
 *
 * @return {Object} A key-value collection of all relevant fields
 */
const activeFields = () => ({
    id: {
        name: 'ID',
        visible: false,
    },
    name: {
        name: 'Name',
        visible: true,
    },
    hostname: {
        name: 'Hostname',
        visible: true,
    },
    nTimeframes: {
        name: '# of Subtimeframes',
        visible: true,
    },
    rootFlpId: {
        name: 'RootFlpId',
        visible: true,
    },
    bytesEquipmentReadOut: {
        name: 'ReadOut in equipment bytes',
        visible: true,
    },
    bytesRecordingReadOut: {
        name: 'ReadOut in recording bytes',
        visible: true,
    },
    bytesFairMQReadOut: {
        name: 'ReadOut in FairMQ bytes',
        visible: true,
    },
    run: {
        name: 'Run',
        visible: true,
        format: (run) => {
            if (run) {
                return frontLink(run.runNumber, 'run-detail', { id: run.id });
            }
            return '-';
        },
    },
});

/**
 * A singular post which is part of a flp
 *
 * @param {Object} model Pass the model to access the defined functions.
 * @param {Object} post all data related to the post
 * @return {vnode} Returns a post
 */
const entry = (model, post) => {
    const postFields = activeFields(model);

    return h('#Flp', Object.entries(postFields).map(([
        key, {
            name,
            format,
        },
    ]) =>
        h(`.w-30rem.flex-row.justify-between#Flp-${key}`, h('b', `${name}:`), format ? format(post[key]) : post[key])));
};

export default entry;
