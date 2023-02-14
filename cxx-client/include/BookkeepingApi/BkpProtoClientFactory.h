//
// Created by mboulais on 02/03/23.
//

#ifndef CXX_CLIENT_BOOKKEEPINGAPI_BKPPROTOCLIENTFACTORY_H
#define CXX_CLIENT_BOOKKEEPINGAPI_BKPPROTOCLIENTFACTORY_H

#include <memory>
#include "BkpProtoClient.h"

namespace o2::bkp::api::proto {
class BkpProtoClientFactory {
 public:
 public:
  BkpProtoClientFactory() = delete;

  /// Provides a Bookkeeping proto API client configured from a given configuration URI
  /// Proto api implements the services defined in the proto files
  static ::std::unique_ptr<BkpProtoClient> create(const ::std::string& gRPCUri);
};
}

#endif // CXX_CLIENT_BOOKKEEPINGAPI_BKPPROTOCLIENTFACTORY_H
