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
import { frontLink } from '../../components/common/navigation/frontLink.js';
import { h, iconHome } from '/js/src/index.js';

/**
 * Error page component that dynamically displays error details based on the model
 * @param {Model} model - Represents the current application state
 * @returns {Component} Error page component
 */
export const ErrorPage = (model) => {
    const { code, codeDescription, message } = model.errorModel.error;
    return h('div.flex-column.justify-center ', [
        h('.flex-column.items-center.g3.mv4', [
            h('img', {
                src: 'assets/alice.png',
                alt: 'Alice logo',
                style: 'width: 200px',
            }),
            h('h2', 'Oops! Something went wrong.'),
            h('h3', `${code} - ${codeDescription}`),
            h('.f5', message),
            frontLink(
                h('div.flex-row.justify-center.items-center.g1', [
                    iconHome(),
                    'Go to Home Page',
                ]),
                'home',
            ),
        ]),
    ]);
};
