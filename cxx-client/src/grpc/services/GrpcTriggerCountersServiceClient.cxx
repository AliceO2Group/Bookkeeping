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

#include "GrpcTriggerCountersServiceClient.h"

using grpc::ClientContext;
using o2::bookkeeping::Empty;
using o2::bookkeeping::TriggerCounterCreateOrUpdateRequest;

namespace o2::bkp::api::grpc::services
{
GrpcTriggerCountersServiceClient::GrpcTriggerCountersServiceClient(const std::shared_ptr<::grpc::ChannelInterface>& channel)
{
  mStub = o2::bookkeeping::TriggerCountersService::NewStub(channel);
}
void GrpcTriggerCountersServiceClient::createOrUpdateForRun(uint32_t runNumber, const std::string& className, int64_t timestamp, uint64_t lmb, uint64_t lma, uint64_t l0b, uint64_t l0a, uint64_t l1b, uint64_t l1a)
{
  ClientContext context;
  TriggerCounterCreateOrUpdateRequest request;
  Empty response;

  request.set_runnumber(runNumber);
  request.set_timestamp(timestamp);
  request.set_classname(className);
  request.set_lmb(lmb);
  request.set_lma(lma);
  request.set_l0b(l0b);
  request.set_l0a(l0a);
  request.set_l1b(l1b);
  request.set_l1a(l1a);

  auto status = mStub->CreateOrUpdateForRun(&context, request, &response);
  if (!status.ok()) {
    throw std::runtime_error(status.error_message());
  }
}
} // namespace o2::bkp::api::grpc::services
