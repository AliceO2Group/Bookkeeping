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
// Created by martin on 13/06/24.
//

#ifndef CXX_CLIENT_BOOKKEEPINGAPI_GRPCCTPTRIGGERCOUNTERSSERVICECLIENT_H
#define CXX_CLIENT_BOOKKEEPINGAPI_GRPCCTPTRIGGERCOUNTERSSERVICECLIENT_H

#include "ctpTriggerCounters.grpc.pb.h"
#include "BookkeepingApi/CtpTriggerCountersServiceClient.h"

namespace o2::bkp::api::grpc::services
{

class GrpcCtpTriggerCountersServiceClient: public CtpTriggerCountersServiceClient
{
 public:
  explicit GrpcCtpTriggerCountersServiceClient(const std::shared_ptr<::grpc::ChannelInterface>& channel, const std::function<std::unique_ptr<::grpc::ClientContext> ()>& clientContextFactory);
  ~GrpcCtpTriggerCountersServiceClient() override = default;

  void createOrUpdateForRun(uint32_t runNumber, const std::string& className, int64_t timestamp, uint64_t lmb, uint64_t lma, uint64_t l0b, uint64_t l0a, uint64_t l1b, uint64_t l1a) override;

 private:
  std::unique_ptr<o2::bookkeeping::CtpTriggerCountersService::Stub> mStub;
  std::function<std::unique_ptr<::grpc::ClientContext> ()> mClientContextFactory;
};

} // namespace o2::bkp::api::grpc::services

#endif // CXX_CLIENT_BOOKKEEPINGAPI_GRPCCTPTRIGGERCOUNTERSSERVICECLIENT_H
