//
// Created by mboulais on 02/03/23.
//

#ifndef CXX_CLIENT_BOOKKEEPINGAPI_BKPPROTOCLIENT_H
#define CXX_CLIENT_BOOKKEEPINGAPI_BKPPROTOCLIENT_H

#include <memory>
#include "RunProtoClient.h"
#include "DplProcessExecutionProtoClient.h"

namespace o2::bkp::api::proto {
class BkpProtoClient {
 public:
  virtual ~BkpProtoClient() = default;

  /// Returns the implementation of the Run service defined in run.proto
  virtual const std::unique_ptr<RunProtoClient>& run() const = 0;

  /// Returns the implementation of the DPL process execution service defined in dpl-process-execution.proto
  virtual const std::unique_ptr<DplProcessExecutionProtoClient>& dplProcessExecution() const = 0;
};
}

#endif // CXX_CLIENT_BOOKKEEPINGAPI_BKPPROTOCLIENT_H
