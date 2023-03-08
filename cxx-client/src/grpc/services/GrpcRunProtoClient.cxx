//
// Created by mboulais on 02/03/23.
//

#include "GrpcRunProtoClient.h"

using grpc::ClientContext;
using o2::bookkeeping::RunWithRelations;
using o2::bookkeeping::Run;
using o2::bookkeeping::RunFetchRequest;
using o2::bookkeeping::RunService;

namespace o2::bkp::api::proto::grpc::services
{
GrpcRunProtoClient::GrpcRunProtoClient(const std::shared_ptr<::grpc::ChannelInterface>& channel)
{
  mStub = RunService::NewStub(channel);
}

std::shared_ptr<RunWithRelations> GrpcRunProtoClient::Get(std::shared_ptr<RunFetchRequest> request)
{
  ClientContext context;
  auto response = std::make_shared<RunWithRelations>();

  auto status = mStub->Get(&context, *request, response.get());

  if (!status.ok()) {
    throw std::runtime_error(status.error_message());
  }
  return response;
}
} // namespace o2::bkp::api::proto::grpc::services
