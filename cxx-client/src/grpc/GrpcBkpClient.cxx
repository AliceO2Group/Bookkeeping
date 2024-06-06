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

using grpc::Channel;

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
using services::GrpcFlpServiceClient;
using services::GrpcDplProcessExecutionClient;
using services::GrpcQcFlagServiceClient;

GrpcBkpClient::GrpcBkpClient(const string& uri)
{
  auto channel = CreateChannel(uri, InsecureChannelCredentials());
  mFlpClient = make_unique<GrpcFlpServiceClient>(channel);
  mDplProcessExecutionClient = make_unique<GrpcDplProcessExecutionClient>(channel);
  mQcFlagClient = make_unique<GrpcQcFlagServiceClient>(channel);
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
} // namespace o2::bkp::api::grpc
