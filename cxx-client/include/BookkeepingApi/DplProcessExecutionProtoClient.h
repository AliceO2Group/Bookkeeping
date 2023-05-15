//
// Created by mboulais on 02/03/23.
//

#ifndef CXX_CLIENT_BOOKKEEPINGAPI_DPLPROCESSEXECUTIONPROTOCLIENT_H
#define CXX_CLIENT_BOOKKEEPINGAPI_DPLPROCESSEXECUTIONPROTOCLIENT_H

#include <memory>
#include "dplProcessExecution.pb.h"

namespace o2::bkp::api::proto
{
class DplProcessExecutionProtoClient
{
 public:
  /// Returns the implementation of the DPL process execution service defined in dplProcessExecution.proto
  virtual std::shared_ptr<o2::bookkeeping::DplProcessExecution> Create(std::shared_ptr<o2::bookkeeping::DplProcessExecutionCreationRequest> request) = 0;

  /// Register the execution fo a DPL process
  virtual void registerProcessExecution(
    int runNumber,
    o2::bookkeeping::DplProcessType type,
    std::string hostname,
    std::string deviceId,
    std::string args,
    std::string detector
  ) = 0;
};
} // namespace o2::bkp::api::proto

#endif // CXX_CLIENT_BOOKKEEPINGAPI_DPLPROCESSEXECUTIONPROTOCLIENT_H
