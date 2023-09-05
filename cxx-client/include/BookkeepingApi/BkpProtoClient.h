//  Copyright 2019-2020 CERN and copyright holders of ALICE O2.
//  See https://alice-o2.web.cern.ch/copyright for details of the copyright holders.
//  All rights not expressly granted are reserved.
//
//  This software is distributed under the terms of the GNU General Public
//  License v3 (GPL Version 3), copied verbatim in the file "COPYING".
//
//  In applying this license CERN does not waive the privileges and immunities
//  granted to it by virtue of its status as an Intergovernmental Organization
//  or submit itself to any jurisdiction.

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
