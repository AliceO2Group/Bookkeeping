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

const secret = process.env?.OPENID_SECRET || null;
const id = process.env?.OPENID_ID || null;
const redirect_uri = process.env?.OPENID_REDIRECT || null;
const well_known = process.env?.OPENID_WELL_KNOWN || 'https://auth.cern.ch/auth/realms/cern/.well-known/openid-configuration';

module.exports = {
    secret,
    id,
    redirect_uri,
    well_known: well_known,
    isValid: () => secret !== null && id !== null && redirect_uri !== null && well_known !== null,
};
