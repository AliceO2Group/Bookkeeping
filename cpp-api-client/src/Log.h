#pragma once
#include <string>
#include <vector>
#include "LogSubtype.h"
#include "LogOrigin.h"
 

namespace bookkeeping
{
struct Log
{
    LogSubtype subtype;
    LogOrigin origin;
    std::string title;
    std::string text;
    std::vector<int64_t> attachmentIds;
    std::vector<int64_t> runIds;
};
}