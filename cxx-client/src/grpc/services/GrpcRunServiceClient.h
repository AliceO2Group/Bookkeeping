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
//

#ifndef CXX_CLIENT_BOOKKEEPINGAPI_GRPCRUNERVICECLIENT_H
#define CXX_CLIENT_BOOKKEEPINGAPI_GRPCRUNERVICECLIENT_H

#include "run.grpc.pb.h"
#include "BookkeepingApi/RunServiceClient.h"

#include <memory>

namespace o2::bkp::api::grpc::services
{

class GrpcRunServiceClient : public RunServiceClient
{
 public:
  explicit GrpcRunServiceClient(const std::shared_ptr<::grpc::ChannelInterface>& channel);
  ~GrpcRunServiceClient() override = default;

  void setRawCtpTriggerConfiguration(int runNumber, std::string rawCtpTriggerConfiguration) override;

 private:
  std::unique_ptr<o2::bookkeeping::RunService::Stub> mStub;
};

} // namespace o2::bkp::api::grpc::services

#endif // CXX_CLIENT_BOOKKEEPINGAPI_GRPCRUNERVICECLIENT_H
