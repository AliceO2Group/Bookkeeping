#pragma once

#include <string>
#include "BookkeepingInterface.h"
#include "cpprest-client/ApiClient.h"
#include "cpprest-client/ApiConfiguration.h"

namespace bookkeeping
{

class BookkeepingApi : public virtual BookkeepingInterface
{
    public:
    BookkeepingApi(std::string url, std::string token);
    virtual void runStart(int64_t runNumber, std::time_t o2Start,
      std::time_t triggerStart, utility::string_t environmentId, 
      RunType runType, int64_t nDetectors, int64_t nFlps, int64_t nEpns,
      bool dd_flp, bool dcs, bool epn, utility::string_t epnTopology) override;
    virtual void runEnd(int64_t runNumber, std::time_t o2End, std::time_t triggerEnd,
      RunQuality runQuality) override;
    virtual void flpAdd(std::string flpName, std::string hostName, int64_t runNumber = -1) override;
    virtual void flpUpdateCounters(std::string flpName, int64_t runNumber,  int64_t nSubtimeframes, int64_t nEquipmentBytes,
      int64_t nRecordingBytes, int64_t nFairMQBytes) override;
    virtual std::vector<std::shared_ptr<org::openapitools::client::model::Run>> getRuns() override;
    virtual void createLog(utility::string_t text, utility::string_t title, std::vector<std::int64_t> runNumbers = {}, std::int64_t parentLogId = -1) override;
    virtual std::vector<std::shared_ptr<org::openapitools::client::model::Log>> getLogs() override;
    virtual void getStatus() override;    
    private:
    std::shared_ptr<org::openapitools::client::api::ApiClient> apiClient;
};

}
