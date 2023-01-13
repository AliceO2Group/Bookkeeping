//
// Created by Barthélémy von Haller on 10.01.23.
//

#include <iostream>
#include "BookkeepingApi/BookkeepingClientFactory.h"
#include "grpc/GrpcBookkeepingClient.h"
#include "Configuration/ConfigurationFactory.h"

using o2::configuration::ConfigurationFactory;

namespace o2::bookkeeping::api
{
std::shared_ptr<BookkeepingClient> BookkeepingClientFactory::fromConfiguration(const std::string& uri)
{
  auto configuration = ConfigurationFactory::getConfiguration(uri);
  return std::make_shared<grpc::GrpcBookkeepingClient>(configuration->get<std::string>("o2.bookkeeping.grpc-url"));
}
} // namespace o2::bookkeeping::api
