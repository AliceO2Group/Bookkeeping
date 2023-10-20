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

const { ApiRunAdapter } = require('./ApiRunAdapter.js');
const { ApiLogAdapter } = require('./ApiLogAdapter.js');
const { ApiLhcFillAdapter } = require('./ApiLhcFillAdapter.js');
const { ApiHostAdapter } = require('./ApiHostAdapter.js');
const { ApiFlpRoleAdapter } = require('./ApiFlpRoleAdapter.js');
const { ApiEnvironmentAdapter } = require('./ApiEnvironmentAdapter.js');
const { ApiDplProcessAdapter } = require('./dpl/ApiDplProcessAdapter.js');
const { ApiDplProcessExecutionAdapter } = require('./dpl/ApiDplProcessExecutionAdapter.js');
const { ApiDplDetectorAdapter } = require('./dpl/ApiDplDetectorAdapter.js');

module.exports = {
    ApiRunAdapter,
    ApiLogAdapter,
    ApiLhcFillAdapter,
    ApiHostAdapter,
    ApiFlpRoleAdapter,
    ApiEnvironmentAdapter,
    ApiDplProcessAdapter,
    ApiDplProcessExecutionAdapter,
    ApiDplDetectorAdapter,
};
