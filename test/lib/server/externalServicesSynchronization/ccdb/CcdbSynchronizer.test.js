const { getGoodPhysicsRunsWithMissingTfTimestamps } = require('../../../../../lib/server/services/run/getRunsMissingTfTimestamps.js');
const { expect } = require('chai');
const { CcdbSynchronizer } = require('../../../../../lib/server/externalServicesSynchronization/ccdb/CcdbSynchronizer.js');
const { runService } = require('../../../../../lib/server/services/run/RunService.js');

const dummyCcdbRunInfo = `Listing content of RCT/Info/RunInformation

ID: dummy-id
Path: RCT/Info/RunInformation
Validity: 108 - 108 (Thu Jan 01 01:09:17 CET 1970 - Thu Jan 01 01:09:17 CET 1970)
Initial validity limit: 108 (Thu Jan 01 01:09:17 CET 1970)
Created: 1565262000000 (Tue Sep 17 13:31:31 CEST 2024)
Last modified: 1726573167825 (Tue Sep 17 13:39:27 CEST 2024)
Original file: tmp.dat, size: 1, md5: fake-md5, content type: application/x-ns-proxy-autoconfig
Uploaded from: 10.161.69.39
Metadata:
  ObjectType = char
  STF = 1565262000000
  ETF = 1565265600000
  SOR = 1565262000000
  UpdatedFrom = 10.161.69.39
  EOR = 1565265600000
  SOX = 1565262000000
  partName = send
  EOX = 1565265600000



Subfolders:`;

module.exports = () => {
    it('Should successfully update good physics runs first and last TF timestamps', async () => {
        const expectedRunNumber = 108;
        const synchronizeAfter = new Date('2019-08-09T00:00:00');

        const goodPhysicsRuns = await getGoodPhysicsRunsWithMissingTfTimestamps(synchronizeAfter);
        expect(goodPhysicsRuns.map(({ runNumber }) => runNumber)).to.eql([expectedRunNumber]);

        const ccdbSynchronizer = new CcdbSynchronizer('dummy-url');
        ccdbSynchronizer.fetchRunInformation = (runNumber) => {
            if (runNumber !== expectedRunNumber) {
                throw new Error(`Expected fetch run information to be called for run number ${expectedRunNumber}`);
            }

            return dummyCcdbRunInfo;
        };
        await ccdbSynchronizer.syncFirstAndLastTf(synchronizeAfter);
        const updatedGoodPhysicsRuns = await getGoodPhysicsRunsWithMissingTfTimestamps(new Date('2019-08-09T00:00:00'));
        expect(updatedGoodPhysicsRuns).to.length(0);

        const updatedRun = await runService.getOrFail({ runNumber: 108 });
        expect(updatedRun.firstTfTimestamp).to.equal(1565262000000);
        expect(updatedRun.lastTfTimestamp).to.equal(1565265600000);
    });
};
