#pragma once
#include <vector>
#include "CreateLogParameters.h"
#include "CreateRunParameters.h"
#include "GetLogsParameters.h"
#include "GetRunsParameters.h"
#include "Log.h"
#include "LogOrigin.h"
#include "LogSubtype.h"
#include "OrderDirection.h"
#include "cpprest-client/model/Run.h"
#include "cpprest-client/model/Log.h"
#include "RunType.h"
#include "RunQuality.h"

#include "cpprest-client/ApiClient.h"
#include "cpprest-client/MultipartFormData.h"
#include "cpprest-client/ModelBase.h"

#include <sstream>
#include <limits>
#include <iomanip>

namespace bookkeeping
{
  class BookkeepingInterface
  {
  public:
    /** 
     * Starts a run
     *
     * @param runNumber Integer ID of a specific data taking session
     * @param o2Start Time (UTC) when command to start a new Run was given
     * @param triggerStart Time (UTC) when Trigger subsystem was started
     * @param activityId Control ID string. Can be a long hash, 32 or 64 character long
     * @param runType Type of run. Might be replaced by tags
     * @param nDetectors Number of detectors in the Run
     * @param nFlps Number of FLP nodes in the Run
     * @param nEpns Number of EPN nodes in the Run
     * @throws org::openapitools::client::api::ApiException
     */
    virtual void runStart(int64_t runNumber, std::time_t o2Start, std::time_t triggerStart,
                          utility::string_t activityId, RunType runType, int64_t nDetectors, int64_t nFlps, int64_t nEpns) = 0;

    /** 
     * @brief Ends a run
     *
     * @param runNumber Integer ID of a specific data taking session
     * @param o2End Time (UTC) when Run was completely stopped
     * @param triggerEnd (UTC) Time when Trigger subsystem was stopped
     * @param runQuality Overall quality of the data from O2 point of view
     * @throws org::openapitools::client::api::ApiException
     */
    virtual void runEnd(int64_t runNumber, std::time_t o2End, std::time_t triggerEnd,
                        RunQuality runQuality) = 0;

    /** 
     * @brief Adds an FLP to a run
     * 
     * @param runNumber Integer ID of a specific data taking session
     * @param flpName Identifying name of the FLP
     * @param hostName Host name of the FLP
     * @throws org::openapitools::client::api::ApiException
     */
    virtual void flpAdd(std::string flpName, std::string hostName, int64_t runNumber = -1) = 0;

    /**
     * @brief Update flp by id
     * 
     * @param flpId Integer ID of a specific data taking session.
     * @param flpName Identifying name of the FLP.
     * @param nSubtimeframes Number of subtimeframes processed in this FLP. Updated regularly.
     * @param nEquipmentBytes Data volume out from the readout 'equipment' component in bytes. Can reach PetaBytes. Updated regularly.
     * @param nRecordingBytes Data volume out from the readout 'recording' component in bytes. Can reach PetaBytes. Updated regularly.
     * @param nFairMqBytes Data volume out from the readout 'fmq' component in bytes. Can reach PetaBytes. Updated regularly.
     * @throws org::openapitools::client::api::ApiException
     */
    virtual void flpUpdateCounters(int64_t flpId, std::string flpName, int64_t nSubtimeframes, int64_t nEquipmentBytes,
                                   int64_t nRecordingBytes, int64_t nFairMQBytes) = 0;

    /** 
     * @brief Create a log
     * 
     * @param text Log entry that is written by the shifter
     * @param title Title for the log
     * @param runNumbers Vector of runNumbers that the log is about
     * @param parentLogId Integer id of the parent log
     * @throws org::openapitools::client::api::ApiException
     */
    virtual void createLog(utility::string_t text, utility::string_t title, std::vector<std::int64_t> runNumbers = {}, std::int64_t parentLogId = -1) = 0;

    /**
     * @brief TODO: not working properly yet. Get the last 100 logs
     * @throws org::openapitools::client::api::ApiException
     * @returns ArrayOfLogsResponse
     */
    virtual std::vector<std::shared_ptr<org::openapitools::client::model::Log>> getLogs() = 0;

    /**
     * @brief TODO: not working properly yet. Gets the last 100 runs
     * @throws org::openapitools::client::api::ApiException
     * @returns ArrayOfRunsResponse
     */
    virtual std::vector<std::shared_ptr<org::openapitools::client::model::Run>> getRuns() = 0;
  };
}