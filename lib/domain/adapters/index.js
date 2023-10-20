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

const apiRunAdapter = new ApiRunAdapter();
const apiLogAdapter = new ApiLogAdapter();
const apiLhcFillAdapter = new ApiLhcFillAdapter();
const apiHostAdapter = new ApiHostAdapter();
const apiFlpRoleAdapter = new ApiFlpRoleAdapter();
const apiEnvironmentAdapter = new ApiEnvironmentAdapter();
const apiDplProcessAdapter = new ApiDplProcessAdapter();
const apiDplProcessExecutionAdapter = new ApiDplProcessExecutionAdapter();
const apiDplDetectorAdapter = new ApiDplDetectorAdapter();

apiDplDetectorAdapter.apiDplProcessExecutionAdapter = apiDplProcessExecutionAdapter;

apiDplProcessAdapter.apiDplProcessExecutionAdapter = apiDplProcessExecutionAdapter;

apiDplProcessExecutionAdapter.apiDplDetectorAdapter = apiDplDetectorAdapter;
apiDplProcessExecutionAdapter.apiHostAdapter = apiHostAdapter;
apiDplProcessExecutionAdapter.apiDplProcessAdapter;
apiDplProcessExecutionAdapter.apiRunAdapter = apiRunAdapter;

apiEnvironmentAdapter.apiRunAdapter = apiRunAdapter;

apiFlpRoleAdapter.apiRunAdapter = apiRunAdapter;

apiHostAdapter.apiDplProcessExecutionAdapter = apiDplProcessExecutionAdapter;

apiLhcFillAdapter.apiRunAdapter = apiRunAdapter;

apiLogAdapter.apiRunAdapter = apiRunAdapter;
apiLogAdapter.apiEnvironmentAdapter = apiEnvironmentAdapter;
apiLogAdapter.apiLhcFillAdapter = apiLhcFillAdapter;

apiRunAdapter.apiLhcFillAdapter = apiLhcFillAdapter;
apiRunAdapter.apiFlpRoleAdapter = apiFlpRoleAdapter;
apiRunAdapter.apiLogAdapter = apiLogAdapter;

module.exports = {
    apiRunAdapter,
    apiLogAdapter,
    apiLhcFillAdapter,
    apiHostAdapter,
    apiFlpRoleAdapter,
    apiEnvironmentAdapter,
    apiDplProcessAdapter,
    apiDplProcessExecutionAdapter,
    apiDplDetectorAdapter,
};
