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

#include "GrpcQcFlagServiceClient.h"

using grpc::ClientContext;

using o2::bookkeeping::DataPassQcFlagCreationRequest;
using o2::bookkeeping::QcFlagCreationResponse;
using o2::bookkeeping::SimulationPassQcFlagCreationRequest;
using o2::bookkeeping::SynchronousQcFlagCreationRequest;

namespace o2::bkp::api::grpc::services
{
GrpcQcFlagServiceClient::GrpcQcFlagServiceClient(const std::shared_ptr<::grpc::ChannelInterface>& channel, const std::function<std::unique_ptr<::grpc::ClientContext> ()>& clientContextFactory)
{
  mStub = o2::bookkeeping::QcFlagService::NewStub(channel);
  mClientContextFactory = clientContextFactory;
}

std::vector<int> grpc::services::GrpcQcFlagServiceClient::createForDataPass(
  uint32_t runNumber,
  const std::string& passName,
  const std::string& detectorName,
  const std::vector<QcFlag>& qcFlags)
{
  DataPassQcFlagCreationRequest request;
  QcFlagCreationResponse response;

  request.set_runnumber(runNumber);
  request.set_passname(passName);
  request.set_detectorname(detectorName);

  for (const auto& qcFlag : qcFlags) {
    auto grpcQcFlag = request.add_flags();
    mirrorQcFlagOnGrpcQcFlag(qcFlag, grpcQcFlag);
  }

  auto context = mClientContextFactory();
  auto status = mStub->CreateForDataPass(context.get(), request, &response);
  if (!status.ok()) {
    throw std::runtime_error(status.error_message());
  }

  auto flagIds = response.flagids();
  return { flagIds.begin(), flagIds.end() };
}

std::vector<int> grpc::services::GrpcQcFlagServiceClient::createForSimulationPass(
  uint32_t runNumber,
  const std::string& productionName,
  const std::string& detectorName,
  const std::vector<QcFlag>& qcFlags)
{
  SimulationPassQcFlagCreationRequest request;
  QcFlagCreationResponse response;

  request.set_runnumber(runNumber);
  request.set_productionname(productionName);
  request.set_detectorname(detectorName);

  for (const auto& qcFlag : qcFlags) {
    auto grpcQcFlag = request.add_flags();
    mirrorQcFlagOnGrpcQcFlag(qcFlag, grpcQcFlag);
  }

  auto context = mClientContextFactory();
  auto status = mStub->CreateForSimulationPass(context.get(), request, &response);
  if (!status.ok()) {
    throw std::runtime_error(status.error_message());
  }

  auto flagIds = response.flagids();
  return { flagIds.begin(), flagIds.end() };
}

std::vector<int> grpc::services::GrpcQcFlagServiceClient::createForSynchronous(
  uint32_t runNumber,
  const std::string& detectorName,
  const std::vector<QcFlag>& qcFlags)
{
  SynchronousQcFlagCreationRequest request;
  QcFlagCreationResponse response;

  request.set_runnumber(runNumber);
  request.set_detectorname(detectorName);

  for (const auto& qcFlag : qcFlags) {
    auto grpcQcFlag = request.add_flags();
    mirrorQcFlagOnGrpcQcFlag(qcFlag, grpcQcFlag);
  }

  auto context = mClientContextFactory();
  auto status = mStub->CreateSynchronous(context.get(), request, &response);
  if (!status.ok()) {
    throw std::runtime_error(status.error_message());
  }

  auto flagIds = response.flagids();
  return { flagIds.begin(), flagIds.end() };
}

void GrpcQcFlagServiceClient::mirrorQcFlagOnGrpcQcFlag(const QcFlag& qcFlag, bookkeeping::QcFlag* grpcQcFlag)
{
  grpcQcFlag->set_flagtypeid(qcFlag.flagTypeId);
  grpcQcFlag->set_origin(qcFlag.origin);

  if (qcFlag.from.has_value()) {
    grpcQcFlag->set_from(qcFlag.from.value());
  }

  if (qcFlag.to.has_value()) {
    grpcQcFlag->set_to(qcFlag.to.value());
  }

  if (qcFlag.comment.has_value())
    grpcQcFlag->set_comment(qcFlag.comment.value());
}

} // namespace o2::bkp::api::grpc::services
