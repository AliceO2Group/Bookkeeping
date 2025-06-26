const { getGoodPhysicsRunsWithMissingTfTimestamps } = require('../../../../../lib/server/services/run/getRunsMissingTfTimestamps.js');
const { expect } = require('chai');
const { CcdbSynchronizer } = require('../../../../../lib/server/externalServicesSynchronization/ccdb/CcdbSynchronizer.js');
const { runService } = require('../../../../../lib/server/services/run/RunService.js');

const dummyCcdbRunInfo = JSON.parse(`{
  "path": "RCT/Info/RunInformation",
  "latest": false,
  "patternMatching": false,
  "validAt": 108,
  "objects": [
    {
      "path": "RCT/Info/RunInformation",
      "createTime": 1565262000000,
      "lastModified": 1565262000000,
      "Created": 1565262000000,
      "Last-Modified": 1565262000000,
      "id": "dummy-id",
      "validFrom": 108,
      "validUntil": 109,
      "initialValidity": 109,
      "MD5": "dummy-md5",
      "fileName": "tmp.dat",
      "contentType": "application/octet-stream",
      "size": 1,
      "ETag": "\\"dummy-etag\\"",
      "Valid-From": 108,
      "Valid-Until": 109,
      "InitialValidityLimit": 109,
      "Content-MD5": "dummy-content-md5",
      "Content-Disposition": "inline;filename=\\"tmp.dat\\"",
      "Content-Type": "application/octet-stream",
      "Content-Length": 1,
      "UploadedFrom": "1.2.3.4",
      "ObjectType": "char",
      "STF": "1565262000000",
      "ETF": "1565265600000",
      "SOR": "1565262000000",
      "EOR": "1565265600000",
      "partName": "send",
      "replicas": [
        "http://dummy-recplica"
      ]
    }
  ],
  "subfolders": []
}`);

module.exports = () => {
    it('Should successfully update good physics runs first and last TF timestamps', async () => {
        const expectedRunNumber = 106;
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

        const updatedRun = await runService.getOrFail({ runNumber: 106 });
        expect(updatedRun.firstTfTimestamp).to.equal(1565262000000);
        expect(updatedRun.lastTfTimestamp).to.equal(1565265600000);
    });
};
