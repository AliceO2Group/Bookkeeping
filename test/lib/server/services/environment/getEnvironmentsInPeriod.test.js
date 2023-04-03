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

const {
    getEnvironmentsInPeriod,
    ENVIRONMENT_CONSIDERED_LOST_AFTER,
} = require('../../../../../lib/server/services/environment/getEnvironmentsInPeriod.js');
const { expect } = require('chai');

module.exports = () => {
    it('should successfully return the list of environments in the given period', async () => {
        const period = {
            from: new Date('2019-08-09T15:00:00Z').getTime(),
            to: new Date('2019-08-09T23:00:00Z').getTime(),
        };

        const environments = await getEnvironmentsInPeriod(
            period,
            { historyItems: true },
        );

        expect(environments.map(({ id }) => id)).to.eql(['Dxi029djX', 'KGIS12DS', 'EIDO13i3D', 'TDI59So3d', 'CmCvjNbg']);
        expect(environments.every((environment) => environment.createdAt.getTime() < period.to && (
            environment.updatedAt.getTime() >= period.from
            || environment.historyItems.every(({ status }) => !['DESTROYED', 'ERROR'].includes(status))
            && environment.updatedAt.getTime() > period.from - ENVIRONMENT_CONSIDERED_LOST_AFTER
        ))).to.be.true;
    });
};
