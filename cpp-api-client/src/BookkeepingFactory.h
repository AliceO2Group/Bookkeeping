#pragma once

#include "BookkeepingInterface.h"
#include <memory>

namespace bookkeeping
{
std::unique_ptr<BookkeepingInterface> getApiInstance(std::string url, std::string token);
}