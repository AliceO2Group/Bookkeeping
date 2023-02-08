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
#include "flp.grpc.pb.h"

using grpc::Channel;

using grpc::CreateChannel;
using grpc::AccessTokenCredentials;
using grpc::InsecureChannelCredentials;
using grpc::CompositeChannelCredentials;
using o2::bkp::api::FlpServiceClient;
using o2::bookkeeping::Flp;
using o2::bookkeeping::FlpService;
using std::make_unique;
using std::string;
using std::unique_ptr;

namespace o2::bkp::api::grpc
{
using services::GrpcFlpServiceClient;

GrpcBkpClient::GrpcBkpClient(const string& uri, const string& token)
{
  auto channel = CreateChannel(
    uri,
    CompositeChannelCredentials(InsecureChannelCredentials(), AccessTokenCredentials(token))
  );
  mFlpClient = make_unique<GrpcFlpServiceClient>(channel);
}

const unique_ptr<FlpServiceClient>& GrpcBkpClient::flp() const
{
  return mFlpClient;
}
} // namespace o2::bkp::api::grpc
