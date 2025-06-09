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

#ifndef CXX_CLIENT_BOOKKEEPINGAPI_DPLPROCESSEXECUTIONCLIENT_H
#define CXX_CLIENT_BOOKKEEPINGAPI_DPLPROCESSEXECUTIONCLIENT_H

#include <memory>
#include "DplProcessType.h"

namespace o2::bkp::api
{
class DplProcessExecutionClient
{
 public:
  virtual ~DplProcessExecutionClient() = default;

  /// Register the execution fo a DPL process
  virtual void registerProcessExecution(
    int runNumber,
    o2::bkp::DplProcessType type,
    std::string hostname,
    std::string deviceId,
    std::string args,
    std::string detector
  ) = 0;
};
} // namespace o2::bkp::api::proto

#endif // CXX_CLIENT_BOOKKEEPINGAPI_DPLPROCESSEXECUTIONCLIENT_H
