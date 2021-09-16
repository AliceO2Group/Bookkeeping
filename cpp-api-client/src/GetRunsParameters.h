#pragma once
#include <cstdint>
#include <string>
#include <boost/optional.hpp>
#include <boost/date_time/posix_time/ptime.hpp>
#include "RunType.h"
#include "RunQuality.h"


namespace bookkeeping
{
struct GetRunsParameters
{
    boost::optional<std::string> orderBy;
    boost::optional<OrderDirection> orderDirection;
    boost::optional<int64_t> pageSize;
    boost::optional<int64_t> pageNumber;
    boost::optional<int64_t> runNumber;
    boost::optional<boost::posix_time::ptime> startTimeO2Start;
    boost::optional<boost::posix_time::ptime> endTimeO2Start;
    boost::optional<boost::posix_time::ptime> startTimeTrgStart;
    boost::optional<boost::posix_time::ptime> endTimeTrgStart;
    boost::optional<boost::posix_time::ptime> startTimeTrgEnd;
    boost::optional<boost::posix_time::ptime> endTimeTrgEnd;
    boost::optional<boost::posix_time::ptime> startTimeO2End;
    boost::optional<boost::posix_time::ptime> endTimeO2End;
    boost::optional<std::string> environmentId;
    boost::optional<RunType> runType;
    boost::optional<RunQuality> runQuality;
};
}