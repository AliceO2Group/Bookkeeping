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

let jwtSecret = 'jiskefet';
let jwtIssuer = 'Arsenic';
let oidcSecret = '1cd50235-a3cf-4d58-9417-ea0f24781b78';
let oidcId = 'jiskefet-test';
let oidcRedirectUri = 'http://localhost:4000/callback';

if (process.env.JWT_SECRET) { 
    jwtSecret = process.env.JWT_SECRET
}

if (process.env.JWT_ISSUER) { 
    jwtIssuer = process.env.JWT_ISSUER
}

if (process.env.OIDC_SECRET) { 
    oidcSecret = process.env.OIDC_SECRET
}

if (process.env.OIDC_ID) { 
    oidcId = process.env.OIDC_ID
}

if (process.env.OIDC_REDIRECT) { 
    oidcRedirectUri = process.env.OIDC_REDIRECT
}

module.exports = {
    jwtSecret,
    jwtIssuer,
    oidcSecret,
    oidcId,
    oidcRedirectUri
};
