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

let secret = null;
let id = null;
let redirect_uri = null;
let well_known = 'https://auth.cern.ch/auth/realms/cern/.well-known/openid-configuration';

if (process.env.OPENID_SECRET) {
    secret = process.env.OPENID_SECRET;
}

if (process.env.OPENID_ID) {
    id = process.env.OPENID_ID;
}

if (process.env.OPENID_REDIRECT) {
    redirect_uri = process.env.OPENID_REDIRECT;
}

if (process.env.OPENID_WELL_KNOWN) {
    well_known = process.env.OPENID_WELL_KNOWN;
}

module.exports = {
    secret,
    id,
    redirect_uri,
    well_known: well_known,
    isValid: () => secret !== null && id !== null && redirect_uri !== null && well_known !== null,
};
