#ifndef CXX_CLIENT_BOOKKEEPINGAPI_BOOKKEEPINGCLIENT_H_
#define CXX_CLIENT_BOOKKEEPINGAPI_BOOKKEEPINGCLIENT_H_

#include <memory>
#include "FlpServiceClient.h"

namespace o2::bookkeeping::api
{
/// Interface for bookkeeping API clients
class BookkeepingClient
{
 public:
  /// Return client for FLP service
  virtual const std::shared_ptr<FlpServiceClient> flp() const = 0;
};
} // namespace o2::bookkeeping::api

#endif // CXX_CLIENT_BOOKKEEPINGAPI_BOOKKEEPINGCLIENT_H_