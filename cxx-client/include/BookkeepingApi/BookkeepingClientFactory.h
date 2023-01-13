//
// Created by Barthélémy von Haller on 10.01.23.
//

#ifndef CXX_CLIENT_BOOKKEEPINGAPI_BOOKKEEPINGCLIENTFACTORY_H
#define CXX_CLIENT_BOOKKEEPINGAPI_BOOKKEEPINGCLIENTFACTORY_H

#include "BookkeepingApi/BookkeepingClient.h"

namespace o2::bookkeeping::api
{
/// Abstract factory for bookkeeping API clients
class BookkeepingClientFactory
{
 public:
  BookkeepingClientFactory() = delete;

  /// Provides a Bookkeeping API client configured from a given configuration URL
  static std::shared_ptr<BookkeepingClient> fromConfiguration(const std::string& uri);
};
} // namespace o2::bookkeeping::api

#endif // CXX_CLIENT_BOOKKEEPINGAPI_BOOKKEEPINGCLIENTFACTORY_H
