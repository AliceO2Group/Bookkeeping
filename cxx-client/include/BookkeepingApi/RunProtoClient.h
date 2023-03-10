//
// Created by mboulais on 02/03/23.
//

#ifndef CXX_CLIENT_BOOKKEEPINGAPI_RUNPROTOCLIENT_H
#define CXX_CLIENT_BOOKKEEPINGAPI_RUNPROTOCLIENT_H

#include <memory>
#include "run.pb.h"

namespace o2::bkp::api::proto
{
class RunProtoClient
{
 public:
  /// Returns the run corresponding to the given run number with optionally its relations
  virtual std::shared_ptr<bookkeeping::RunWithRelations> Get(const int runNumber, const std::vector<o2::bookkeeping::RunRelations>& relations) = 0;

  /// Returns the run and the asked relations defined in the given request
  virtual std::shared_ptr<o2::bookkeeping::RunWithRelations> Get(std::shared_ptr<o2::bookkeeping::RunFetchRequest> request) = 0;
};
} // namespace o2::bkp::api::proto

#endif // BOOKKEEPINGAPI_RUNPROTOCLIENT_H
