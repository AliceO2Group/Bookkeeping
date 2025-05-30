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

#include "GrpcRunServiceClient.h"

#include <memory>

using grpc::ClientContext;

using o2::bookkeeping::RunUpdateRequest;
using o2::bookkeeping::Run;

namespace o2::bkp::api::grpc::services
{
GrpcRunServiceClient::GrpcRunServiceClient(const std::shared_ptr<::grpc::ChannelInterface>& channel, const std::function<std::unique_ptr<::grpc::ClientContext> ()>& clientContextFactory)
{
  mStub = o2::bookkeeping::RunService::NewStub(channel);
  mClientContextFactory = clientContextFactory;
}
void GrpcRunServiceClient::setRawCtpTriggerConfiguration(int runNumber, std::string rawCtpTriggerConfiguration) {
  RunUpdateRequest updateRequest{};
  Run updatedRun;

  updateRequest.set_runnumber(runNumber);
  updateRequest.set_rawctptriggerconfiguration(rawCtpTriggerConfiguration);

  auto context = mClientContextFactory();
  auto status = mStub->Update(context.get(), updateRequest, &updatedRun);
  if (!status.ok()) {
    throw std::runtime_error(status.error_message());
  }
}
} // namespace o2::bkp::api::grpc::services
