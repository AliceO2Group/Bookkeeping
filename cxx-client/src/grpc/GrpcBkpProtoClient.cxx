//
// Created by mboulais on 02/03/23.
//

#include "GrpcBkpProtoClient.h"
#include <grpc++/grpc++.h>
#include <memory>
#include "grpc/services/GrpcRunProtoClient.h"

using grpc::InsecureChannelCredentials;
using o2::bkp::api::proto::RunProtoClient;
using std::make_unique;

namespace o2::bkp::api::proto::grpc
{
GrpcBkpProtoClient::GrpcBkpProtoClient(const std::string& uri)
{
  auto channel = CreateChannel(uri, InsecureChannelCredentials());
  mRunClient = make_unique<services::GrpcRunProtoClient>(channel);
}

const std::unique_ptr<RunProtoClient>& GrpcBkpProtoClient::run() const
{
  return mRunClient;
}
} // namespace o2::bkp::api::proto
