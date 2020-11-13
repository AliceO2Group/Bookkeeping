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
#include "Run.h"
#include "RunType.h"
#include "RunQuality.h"

#include "ApiClient.h"
#include "MultipartFormData.h"
#include "ModelBase.h"

#include <sstream>
#include <limits>
#include <iomanip>


namespace bookkeeping
{
class BookkeepingInterface {
    public: 

    /// Starts a run
    ///
    /// @param runNumber Integer ID of a specific data taking session.
    /// @param o2Start Time (UTC) when command to start a new Run was given.
    /// @param triggerStart Time (UTC) when Trigger subsystem was started.
    /// @param activityId Control ID string. Can be a long hash, 32 or 64 character long.
    /// @param runType Type of run. Might be replaced by tags.
    /// @param nDetectors Number of detectors in the Run.
    /// @param nFlps Number of FLP nodes in the Run.
    /// @param nEpns Number of EPN nodes in the Run.
    virtual void runStart(int64_t runNumber, boost::posix_time::ptime o2Start, boost::posix_time::ptime triggerStart,
      utility::string_t activityId, RunType runType, int64_t nDetectors, int64_t nFlps, int64_t nEpns) = 0;

    /// Ends a run
    ///
    /// @param runNumber Integer ID of a specific data taking session.
    /// @param o2End Time (UTC) when Run was completely stopped.
    /// @param triggerEnd (UTC) Time when Trigger subsystem was stopped.
    /// @param runQuality Overall quality of the data from O2 point of view.
    virtual void runEnd(int64_t runNumber, boost::posix_time::ptime o2End, boost::posix_time::ptime triggerEnd,
      RunQuality runQuality) = 0;

    // /// Adds an FLP to a run
    // ///
    // /// @param runNumber Integer ID of a specific data taking session.
    // /// @param flpName Identifying name of the FLP.
    // /// @param hostName Host name of the FLP.
    // virtual void flpAdd(int64_t runNumber, std::string flpName, std::string hostName) = 0;
    
    // /// Updates the counters of an FLP
    // ///
    // /// @param runNumber Integer ID of a specific data taking session.
    // /// @param flpName Identifying name of the FLP.
    // /// @param nSubtimeframes Number of subtimeframes processed in this FLP. Updated regularly.
    // /// @param nEquipmentBytes Data volume out from the readout 'equipment' component in bytes. Can reach PetaBytes. Updated regularly.
    // /// @param nRecordingBytes Data volume out from the readout 'recording' component in bytes. Can reach PetaBytes. Updated regularly.
    // /// @param nFairMqBytes Data volume out from the readout 'fmq' component in bytes. Can reach PetaBytes. Updated regularly.
    // virtual void flpUpdateCounters(int64_t runNumber, std::string flpName, int64_t nSubtimeframes, int64_t nEquipmentBytes,
    //   int64_t nRecordingBytes, int64_t nFairMqBytes) = 0;

    // virtual std::vector<Run> getRuns(const GetRunsParameters& parameters) = 0;

    /// Create a log
    /// 
    /// @param parameters Parameters for the log.
    /// @return The ID of the created log.
    virtual void createLog(utility::string_t text, utility::string_t title, std::vector<std::int64_t> runNumbers = {}, std::int64_t parentLogId = -1) = 0;
    
    // virtual std::vector<Log> getLogs(const GetLogsParameters& parameters) = 0;
};
}