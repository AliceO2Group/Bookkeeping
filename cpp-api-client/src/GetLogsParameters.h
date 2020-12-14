#pragma once
#include <cstdint>
#include <string>
#include <boost/optional.hpp>
#include "LogSubtype.h"
#include "LogOrigin.h"
#include "OrderDirection.h"


namespace bookkeeping
{
struct GetLogsParameters
{
    boost::optional<std::string> orderBy;
    boost::optional<OrderDirection> orderDirection;
    boost::optional<int64_t> pageSize;
    boost::optional<int64_t> pageNumber;
    boost::optional<int64_t> logId;
    boost::optional<std::string> searchterm;
    boost::optional<LogSubtype> subtype;
    boost::optional<LogOrigin> origin;
    boost::optional<std::string> startCreationTime;
    boost::optional<std::string> endCreationTime;
};
}