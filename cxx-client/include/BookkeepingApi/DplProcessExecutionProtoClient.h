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

#ifndef CXX_CLIENT_BOOKKEEPINGAPI_DPLPROCESSEXECUTIONPROTOCLIENT_H
#define CXX_CLIENT_BOOKKEEPINGAPI_DPLPROCESSEXECUTIONPROTOCLIENT_H

#include <memory>
#include "dplProcessExecution.pb.h"

namespace o2::bkp::api::proto
{
class DplProcessExecutionProtoClient
{
 public:
  virtual ~DplProcessExecutionProtoClient() = default;

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
