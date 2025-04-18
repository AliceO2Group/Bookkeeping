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

#include "GrpcBkpClient.h"
#include <memory>
#include <grpc++/grpc++.h>
#include "grpc/services/GrpcFlpServiceClient.h"
#include "grpc/services/GrpcDplProcessExecutionClient.h"
#include "grpc/services/GrpcQcFlagServiceClient.h"
#include "grpc/services/GrpcCtpTriggerCountersServiceClient.h"
#include "grpc/services/GrpcRunServiceClient.h"

using grpc::Channel;

using grpc::ClientContext;
using grpc::CreateChannel;
using grpc::InsecureChannelCredentials;
using o2::bkp::api::FlpServiceClient;
using o2::bookkeeping::Flp;
using o2::bookkeeping::FlpService;
using std::make_unique;
using std::string;
using std::unique_ptr;

namespace o2::bkp::api::grpc
{
using services::GrpcCtpTriggerCountersServiceClient;
using services::GrpcDplProcessExecutionClient;
using services::GrpcFlpServiceClient;
using services::GrpcQcFlagServiceClient;
using services::GrpcRunServiceClient;

GrpcBkpClient::GrpcBkpClient(const string& uri, const std::function<std::unique_ptr<ClientContext>()>& clientContextFactory)
{
  auto channel = CreateChannel(uri, InsecureChannelCredentials());

  mFlpClient = make_unique<GrpcFlpServiceClient>(channel, clientContextFactory);
  mDplProcessExecutionClient = make_unique<GrpcDplProcessExecutionClient>(channel, clientContextFactory);
  mQcFlagClient = make_unique<GrpcQcFlagServiceClient>(channel, clientContextFactory);
  mCtpTriggerCountersClient = make_unique<GrpcCtpTriggerCountersServiceClient>(channel, clientContextFactory);
  mRunClient = make_unique<GrpcRunServiceClient>(channel, clientContextFactory);
}

const unique_ptr<FlpServiceClient>& GrpcBkpClient::flp() const
{
  return mFlpClient;
}

const std::unique_ptr<DplProcessExecutionClient>& GrpcBkpClient::dplProcessExecution() const
{
  return mDplProcessExecutionClient;
}

const unique_ptr<QcFlagServiceClient>& GrpcBkpClient::qcFlag() const
{
  return mQcFlagClient;
}

const unique_ptr<CtpTriggerCountersServiceClient>& GrpcBkpClient::ctpTriggerCounters() const
{
  return mCtpTriggerCountersClient;
}

const unique_ptr<CtpTriggerCountersServiceClient>& GrpcBkpClient::triggerCounters() const
{
  return mCtpTriggerCountersClient;
}

const unique_ptr<RunServiceClient>& GrpcBkpClient::run() const
{
  return mRunClient;
}
} // namespace o2::bkp::api::grpc
