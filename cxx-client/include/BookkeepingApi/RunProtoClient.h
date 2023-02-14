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
  virtual std::shared_ptr<o2::bookkeeping::Run> Get(const int runNumber) = 0;
  virtual std::shared_ptr<o2::bookkeeping::Run> Get(std::shared_ptr<o2::bookkeeping::RunFetchRequest> request) = 0;
};
} // namespace o2::bkp::api::proto

#endif // BOOKKEEPINGAPI_RUNPROTOCLIENT_H
