#pragma once
#include <vector>
#include <string>
#include <cstdint>
#include "LogSubtype.h"
#include "LogOrigin.h"

namespace bookkeeping
{
struct CreateLogParameters
{
    struct Attachment
    {
        std::string title;
        std::string fileMime;
        std::string fileData;
    };

    LogSubtype subtype;
    LogOrigin origin;
    std::string title;
    std::string text;
    std::vector<Attachment> attachments;
    std::vector<int64_t> runIds;
};
}