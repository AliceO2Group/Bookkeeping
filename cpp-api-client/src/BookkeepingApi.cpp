#include "BookkeepingApi.h"
#include <algorithm>
#include <boost/date_time/posix_time/ptime.hpp>
#include <boost/date_time/posix_time/time_parsers.hpp>
#include <boost/date_time/posix_time/time_formatters.hpp>
#include <boost/date_time/time_facet.hpp>
#include <cpprest/json.h>
#include "cpprest-client/api/FlpApi.h"
#include "cpprest-client/api/LogApi.h"
#include "cpprest-client/api/RunApi.h"
#include "cpprest-client/model/RunType.h"

namespace bookkeeping
{

namespace
{

static uint64_t getUnixTimeStamp(const std::time_t* t = nullptr)
{
    //if specific time is not passed then get current time
    std::time_t st = t == nullptr ? std::time(nullptr) : *t;
    auto millisecs = (static_cast<std::chrono::milliseconds>(st).count() * 1000);
    return static_cast<uint64_t>(millisecs);
}

std::string orderDirectionToString(OrderDirection orderDirection) {
    switch (orderDirection) {
        case OrderDirection::ASC: return "ASC";
        case OrderDirection::DESC: return "DESC";
        default: throw std::runtime_error("Unknown OrderDirection enum value");
    }    
}

std::string logSubtypeToString(LogSubtype logSubtype) {
    switch (logSubtype) {
        case LogSubtype::RUN: return "run";
        case LogSubtype::SUBSYSTEM: return "subsystem";
        case LogSubtype::ANNOUNCEMENT: return "announcement";
        case LogSubtype::INTERVENTION: return "intervention";
        case LogSubtype::COMMENT: return "comment";
        default: throw std::runtime_error("Unknown LogSubtype enum value");
    }
}

std::string logOriginToString(LogOrigin logOrigin) {
    switch (logOrigin) {
        case LogOrigin::HUMAN: return "human";
        case LogOrigin::PROCESS: return "process";
        default: throw std::runtime_error("Unknown LogOrigin enum value");
    }
}

const std::shared_ptr<org::openapitools::client::model::RunType> runTypeToActualRunType(RunType runType) {
    const auto actualRunType = new org::openapitools::client::model::RunType();
    switch (runType) {
        case RunType::PHYSICS: actualRunType->setValue(org::openapitools::client::model::RunType::eRunType::RunType_PHYSICS);
            break;
        case RunType::COSMICS: actualRunType->setValue(org::openapitools::client::model::RunType::eRunType::RunType_COSMICS);
            break;
        case RunType::TECHNICAL: actualRunType->setValue(org::openapitools::client::model::RunType::eRunType::RunType_TECHNICAL);
            break;
        default: throw std::runtime_error("Unknown RunType enum value");
    }
    return std::make_shared<org::openapitools::client::model::RunType>(*actualRunType);
}

const std::shared_ptr<org::openapitools::client::model::RunQuality> runQualityToActualRunQuality(RunQuality runQuality) {
    const auto actualRunQuality = new org::openapitools::client::model::RunQuality();
    switch (runQuality) {
        case RunQuality::GOOD: actualRunQuality->setValue(org::openapitools::client::model::RunQuality::eRunQuality::RunQuality_GOOD);
            break;
        case RunQuality::BAD: actualRunQuality->setValue(org::openapitools::client::model::RunQuality::eRunQuality::RunQuality_BAD);
            break;
        case RunQuality::UNKNOWN: actualRunQuality->setValue(org::openapitools::client::model::RunQuality::eRunQuality::RunQuality_UNKNOWN);
            break;
        default: throw std::runtime_error("Unknown RunQuality enum value");
    }
    return std::make_shared<org::openapitools::client::model::RunQuality>(*actualRunQuality);
}

std::string runQualityToString(RunQuality runQuality) {
    switch (runQuality) {
        case RunQuality::GOOD: return "GOOD";
        case RunQuality::BAD: return "BAD";
        case RunQuality::UNKNOWN: return "UNKNOWN";
        default: throw std::runtime_error("Unknown RunQuality enum value");
    }    
}

utility::datetime ptimeToDateTime(boost::posix_time::ptime t)
{
    auto s = boost::posix_time::to_iso_extended_string(t);
    // For now, we chop off the fractional seconds, the datetime thing doesn't like it
    auto dotPos = s.find_first_of(".");
    auto sub = s.substr(0, dotPos);
    sub += "Z"; // Add timezone, we assume UTC+0 / Zulu
    return utility::datetime::from_string(sub, utility::datetime::ISO_8601);
};

boost::posix_time::ptime datetimeToPtime(utility::datetime t)
{
    return boost::posix_time::from_iso_extended_string(t.to_string(utility::datetime::ISO_8601));
}

boost::posix_time::ptime ptimeFromString(std::string t)
{
    // Boost doesn't like the Z at the end..
    if (!t.empty() && (t.back() == 'Z')) {
        t.pop_back();
    }
    return boost::posix_time::from_iso_extended_string(t);
}
}

BookkeepingApi::BookkeepingApi(std::string url, std::string token)
{
    apiClient = std::make_shared<org::openapitools::client::api::ApiClient>();
    auto apiConfiguration = std::make_shared<org::openapitools::client::api::ApiConfiguration>();
    apiConfiguration->setBaseUrl(url);
    apiConfiguration->setApiKey("Authorization", " Bearer " + token);
    apiConfiguration->setUserAgent("BookkeepingCppApi");
    apiClient->setConfiguration(apiConfiguration);
}


void BookkeepingApi::runStart(int64_t runNumber, std::time_t o2Start,
      std::time_t triggerStart, utility::string_t activityId, 
      RunType runType, int64_t nDetectors, int64_t nFlps, int64_t nEpns) 
{
    org::openapitools::client::api::RunApi runApi(apiClient);
    auto run = std::make_shared<org::openapitools::client::model::Run>();
    run->setRunNumber(runNumber);
    run->setTimeO2Start(getUnixTimeStamp(&o2Start));
    run->setTimeTrgStart(getUnixTimeStamp(&triggerStart));
    run->setRunType(runTypeToActualRunType(runType));
    run->setActivityId(activityId);
    run->setNDetectors(nDetectors);
    run->setNFlps(nFlps);
    run->setNEpns(nEpns);
    runApi.createRun(run).get();
}

void BookkeepingApi::runEnd(int64_t runNumber, std::time_t o2End, std::time_t triggerEnd,
      RunQuality runQuality)
{
    org::openapitools::client::api::RunApi runApi(apiClient);
    auto run = std::make_shared<org::openapitools::client::model::Run>();
    run->setTimeO2End(getUnixTimeStamp(&o2End));
    run->setTimeTrgEnd(getUnixTimeStamp(&triggerEnd));
    run->setRunQuality(runQualityToActualRunQuality(runQuality));
    runApi.endRun(runNumber, run).get();
}

void BookkeepingApi::flpAdd(std::string flpName, std::string hostName, int64_t runNumber)
{
    org::openapitools::client::api::FlpApi flpApi(apiClient);
    auto flp = std::make_shared<org::openapitools::client::model::CreateFlp>();

    if(runNumber != -1)
    {
        flp->setRunNumber(runNumber);
    }

    flp->setName(flpName);
    flp->setHostname(hostName);
    flpApi.createFlp(flp).get();
}

void BookkeepingApi::flpUpdateCounters(int64_t flpId, std::string flpName, int64_t nSubtimeframes, int64_t nEquipmentBytes,
      int64_t nRecordingBytes, int64_t nFairMQBytes)
{
    org::openapitools::client::api::FlpApi flpApi(apiClient);
    auto flp = std::make_shared<org::openapitools::client::model::UpdateFlp>();
    flp->setBytesEquipmentReadOut(nEquipmentBytes);
    flp->setBytesFairMQReadOut(nFairMQBytes);
    flp->setNTimeframes(nSubtimeframes);
    flp->setBytesRecordingReadOut(nRecordingBytes);
    flpApi.updateFlp(flpId, flp).get();
}

void BookkeepingApi::createLog(utility::string_t text, utility::string_t title, std::vector<std::int64_t> runNumbers, std::int64_t parentLogId)
{
    org::openapitools::client::api::LogApi api(apiClient);
    auto log = std::make_shared<org::openapitools::client::model::CreateLog>();
    log->setText(text);
    log->setTitle(title);

    // Convert to serialized string of run numbers, comma separated.
    std::string s = "";
    for(auto const& e : runNumbers) s += std::to_string(e) + ",";
    s.pop_back();
    log->setRunNumbers(s);

    if(parentLogId != -1){
        log->setParentLogId(parentLogId);
    }
    
    std::cout << s << std::endl;
    api.createLog(log).get();
}

// TODO: Doesn't work properly with 64 bit yet.
// Changing the way of retrieving the data does seem to be the possible solution, but we haven't figured it out yet.
std::vector<std::shared_ptr<org::openapitools::client::model::Log>> BookkeepingApi::getLogs()
{
    return org::openapitools::client::api::LogApi(apiClient).listLogs().get()->getData();
}

// TODO: Doesn't work properly with 64 bit yet.
// Changing the way of retrieving the data does seem to be the possible solution, but we haven't figured it out yet.
std::vector<std::shared_ptr<org::openapitools::client::model::Run>> BookkeepingApi::getRuns()
{
    return org::openapitools::client::api::RunApi(apiClient).listRuns().get()->getData();
}
}