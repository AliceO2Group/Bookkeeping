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

#include "GrpcFlpServiceClient.h"
#include "flp.grpc.pb.h"

using grpc::Channel;
using grpc::ChannelInterface;
using grpc::ClientContext;
using grpc::Status;
using o2::bookkeeping::UpdateCountersRequest;

namespace o2::bkp::api::grpc::services
{
GrpcFlpServiceClient::GrpcFlpServiceClient(const std::shared_ptr<::grpc::ChannelInterface>& channel, const std::function<std::unique_ptr<::grpc::ClientContext>()>& clientContextFactory){
  mStub = o2::bookkeeping::FlpService::NewStub(channel);
  mClientContextFactory = clientContextFactory;
}

void GrpcFlpServiceClient::updateReadoutCountersByFlpNameAndRunNumber(
  const std::string& flpName,
  int32_t runNumber,
  uint64_t nSubtimeframes,
  uint64_t nEquipmentBytes,
  uint64_t nRecordingBytes,
  uint64_t nFairMQBytes)
{
  o2::bookkeeping::Flp updatedFlp;
  UpdateCountersRequest request;

  request.set_flpname(flpName);
  request.set_runnumber(runNumber);
  request.set_nsubtimeframes(nSubtimeframes);
  request.set_nequipmentbytes(nEquipmentBytes);
  request.set_nrecordingbytes(nRecordingBytes);
  request.set_nfairmqbytes(nFairMQBytes);

  auto status = mStub->UpdateCounters(mClientContextFactory().get(), request, &updatedFlp);

  if (!status.ok()) {
    throw std::runtime_error(status.error_message());
  }
}
} // namespace o2::bkp::api::grpc::services
