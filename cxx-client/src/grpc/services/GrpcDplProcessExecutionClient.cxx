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

#include "GrpcDplProcessExecutionClient.h"

using grpc::ClientContext;
using o2::bkp::DplProcessType;
using o2::bookkeeping::DplProcessExecution;
using o2::bookkeeping::DplProcessExecutionCreationRequest;
using o2::bookkeeping::DplProcessExecutionService;

namespace o2::bkp
{

namespace api::grpc::services
{
GrpcDplProcessExecutionClient::GrpcDplProcessExecutionClient(const std::shared_ptr<::grpc::ChannelInterface>& channel, const std::function<std::unique_ptr<::grpc::ClientContext> ()>& clientContextFactory)
{
  mStub = DplProcessExecutionService::NewStub(channel);
  mClientContextFactory = clientContextFactory;
}

void GrpcDplProcessExecutionClient::registerProcessExecution(
  int runNumber,
  DplProcessType type,
  std::string hostname,
  std::string deviceId,
  std::string args,
  std::string detector)
{
  auto request = std::make_shared<DplProcessExecutionCreationRequest>();
  request->set_runnumber(runNumber);
  request->set_detectorname(detector);
  request->set_processname(deviceId);
  request->set_type(static_cast<o2::bookkeeping::DplProcessType>(type));
  request->set_hostname(hostname);

  auto response = std::make_shared<DplProcessExecution>();

  auto status = mStub->Create(mClientContextFactory().get(), *request, response.get());

  if (!status.ok()) {
    throw std::runtime_error(status.error_message());
  }
}
} // namespace api::grpc::services

} // namespace o2::bkp
