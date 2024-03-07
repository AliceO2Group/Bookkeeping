/*
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

/**
 * Create promise which is resolved when last initiated download is completed and rejected when canceled
 * @param {CDPSession} session puppetear CDP session
 * @param {number} [timeout = 10000] download timeout
 * @return {Promise} promise
 * !!! Downloading requires to set 'Browser.setDownloadBehavior' behaviour on the given CDP session
 */
async function waitForDownload(session, timeout = 10000) {
    return new Promise((resolve, reject) => {
        session.on('Browser.downloadProgress', (event) => {
            if (event.state === 'completed') {
                resolve('download completed');
            } else if (event.state === 'canceled') {
                reject('download canceled');
            }
        });
        setTimeout(() => reject('Timeout for download'), timeout);
    });
}

exports.waitForDownload = waitForDownload;
