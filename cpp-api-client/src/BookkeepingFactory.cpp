#include "BookkeepingFactory.h"
#include "BookkeepingApi.h"


namespace bookkeeping
{
std::unique_ptr<BookkeepingInterface> getApiInstance(std::string url, std::string token)
{
    auto instance = std::make_unique<BookkeepingApi>(url, token);
    instance->getStatus();
    return instance;
}
}
