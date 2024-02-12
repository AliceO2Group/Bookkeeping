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
import errorAlert from '../../../components/common/errorAlert.js';
import { logReplyComponent } from './logReplyComponent.js';

/**
 * Page displaying log reply form
 *
 * @param {Model} model the global model
 * @return {Component} the resulting component
 */
export const LogReplyPage = ({ logs: { replyModel } }) => {
    if (!replyModel) {
        return errorAlert({
            title: 'Incoherent state',
            detail: 'The page internal state is broken, please try to refresh the page',
        });
    }

    return logReplyComponent(replyModel);
};
