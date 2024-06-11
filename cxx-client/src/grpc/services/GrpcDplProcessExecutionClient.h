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

#ifndef CXX_CLIENT_BOOKKEEPINGAPI_GRPC_SERVICES_GRPCDPLPROCESSEXECUTIONCLIENT_H
#define CXX_CLIENT_BOOKKEEPINGAPI_GRPC_SERVICES_GRPCDPLPROCESSEXECUTIONCLIENT_H

#include "BookkeepingApi/DplProcessExecutionClient.h"
#include "dplProcessExecution.grpc.pb.h"
#include "BookkeepingApi/QcFlag.h"

namespace o2::bkp::api::grpc::services
{
class GrpcDplProcessExecutionClient : public ::o2::bkp::api::DplProcessExecutionClient
{
 public:
  explicit GrpcDplProcessExecutionClient(const std::shared_ptr<::grpc::ChannelInterface>& channel);

  void registerProcessExecution(
    int runNumber,
    o2::bkp::DplProcessType type,
    std::string hostname,
    std::string deviceId,
    std::string args,
    std::string detector) override;

 private:
  std::unique_ptr<o2::bookkeeping::DplProcessExecutionService::Stub> mStub;
};
} // namespace o2::bkp::api::grpc::services

#endif // CXX_CLIENT_BOOKKEEPINGAPI_GRPC_SERVICES_GRPCDPLPROCESSEXECUTIONCLIENT_H
