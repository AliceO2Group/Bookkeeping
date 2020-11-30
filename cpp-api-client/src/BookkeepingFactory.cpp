#include "BookkeepingFactory.h"
#include "BookkeepingApi.h"


namespace bookkeeping
{
std::unique_ptr<BookkeepingInterface> getApiInstance(std::string url, std::string token)
{
    return std::make_unique<BookkeepingApi>(url, token);
}
}