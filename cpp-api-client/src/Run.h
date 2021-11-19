#pragma once
#include <cstdint>
#include <string>
#include <boost/optional.hpp>
#include <boost/date_time/posix_time/ptime.hpp>


namespace bookkeeping
{
struct Run
{
    int64_t runNumber;
    boost::posix_time::ptime timeO2Start;
    boost::posix_time::ptime timeTrgStart;
    boost::posix_time::ptime timeO2End;
    boost::posix_time::ptime timeTrgEnd;
    std::string runType;
    std::string runQuality;
    std::string environmentId;
    int64_t nDetectors;
    int64_t nFlps;
    int64_t nEpns;
    int64_t nTimeframes;
    int64_t nSubtimeframes;
    int64_t bytesReadOut;
    int64_t bytesTimeframeBuilder;
};
}