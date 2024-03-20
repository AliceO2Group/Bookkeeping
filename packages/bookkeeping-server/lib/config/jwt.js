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

// Default configuration
const secret = process.env?.JWT_SECRET || null;
const expiration = process.env?.JWT_EXPIRATION || '1y';
const issuer = process.env?.JWT_ISSUER || 'o2-ui';
const maxAge = process.env?.JWT_MAX_AGE || '1y';

module.exports = {
    secret,
    expiration,
    issuer,
    maxAge,
};
