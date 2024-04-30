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

#include "GrpcBkpProtoClient.h"
#include <grpc++/grpc++.h>
#include <memory>
#include "grpc/services/GrpcRunProtoClient.h"
#include "grpc/services/GrpcDplProcessExecutionProtoClient.h"

using grpc::InsecureChannelCredentials;
using o2::bkp::api::proto::RunProtoClient;
using std::make_unique;

namespace o2::bkp::api::proto::grpc
{
GrpcBkpProtoClient::GrpcBkpProtoClient(const std::string& uri)
{
  auto channel = CreateChannel(uri, InsecureChannelCredentials());
  mRunClient = make_unique<services::GrpcRunProtoClient>(channel);
  mDplProcessExecutionClient = make_unique<services::GrpcDplProcessExecutionProtoClient>(channel);
}

const std::unique_ptr<RunProtoClient>& GrpcBkpProtoClient::run() const
{
  return mRunClient;
}

const std::unique_ptr<DplProcessExecutionProtoClient>& GrpcBkpProtoClient::dplProcessExecution() const
{
  return mDplProcessExecutionClient;
}
} // namespace o2::bkp::api::proto
