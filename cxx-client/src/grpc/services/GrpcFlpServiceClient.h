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
// Created by martin on 12/01/23.
//

#ifndef BOOKKEEPINGAPI_GRPC_SERVICES_GRPCFLPSERVICECLIENT_H_
#define BOOKKEEPINGAPI_GRPC_SERVICES_GRPCFLPSERVICECLIENT_H_

#include "BookkeepingApi/FlpServiceClient.h"
#include "flp.grpc.pb.h"

namespace o2::bookkeeping::api::grpc::services
{
/// gRPC based implementation of FlpServiceClient
class GrpcFlpServiceClient : public FlpServiceClient
{
 public:
  explicit GrpcFlpServiceClient(const std::shared_ptr<::grpc::ChannelInterface> channel);

  void updateReadoutCountersByFlpNameAndRunNumber(
    const std::string& flpName,
    int32_t runNumber,
    int64_t nSubtimeframes,
    int64_t nEquipmentBytes,
    int64_t nRecordingBytes,
    int64_t nFairMQBytes) override;

 private:
  std::unique_ptr<o2::bookkeeping::FlpService::Stub> mStub;
};
} // namespace o2::bookkeeping::api::grpc::services

#endif // BOOKKEEPINGAPI_GRPC_SERVICES_GRPCFLPSERVICECLIENT_H_
