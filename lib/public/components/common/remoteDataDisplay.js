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
import spinner from './spinner.js';
import errorAlert from './errorAlert.js';

/**
 * Render a given remote data using default renderers for non-success cases
 *
 * @param {RemoteData} remoteData the remote data to display
 * @param {Object} renderers the functions to render specific states of the remote data
 * @param {function} renderers.Success the functions to render remote data success payload
 * @param {function} [renderers.NotAsked] the functions to render remote data when not asked, defaults to a null component
 * @param {function} [renderers.Loading] the functions to render remote data when not asked, defaults to a spinner
 * @param {function} [renderers.Failure] the functions to render remote data error payload, defaults to {@see errorAlert}
 * @return {Component} the remote data display
 */
export const remoteDataDisplay = (remoteData, renderers) => remoteData.match({
    NotAsked: renderers.NotAsked ?? (() => null),
    Loading: renderers.Loading ?? (() => spinner()),
    Failure: renderers.Failure ?? ((errors) => errorAlert(errors)),
    Success: (payload) => renderers.Success(payload),
});
