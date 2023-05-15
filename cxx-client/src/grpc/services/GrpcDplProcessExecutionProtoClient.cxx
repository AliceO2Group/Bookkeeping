//
// Created by mboulais on 02/03/23.
//

#include "GrpcDplProcessExecutionProtoClient.h"

using grpc::ClientContext;
using o2::bookkeeping::DplProcessType;
using o2::bookkeeping::DplProcessExecution;
using o2::bookkeeping::DplProcessExecutionService;
using o2::bookkeeping::DplProcessExecutionCreationRequest;

namespace o2::bkp::api::proto::grpc::services
{
GrpcDplProcessExecutionProtoClient::GrpcDplProcessExecutionProtoClient(const std::shared_ptr<::grpc::ChannelInterface>& channel)
{
  mStub = DplProcessExecutionService::NewStub(channel);
}

std::shared_ptr<DplProcessExecution> GrpcDplProcessExecutionProtoClient::Create(std::shared_ptr<DplProcessExecutionCreationRequest> request)
{
  ClientContext context;
  auto response = std::make_shared<DplProcessExecution>();

  auto status = mStub->Create(&context, *request, response.get());

  if (!status.ok()) {
    throw std::runtime_error(status.error_message());
  }
  return response;
}
void GrpcDplProcessExecutionProtoClient::registerProcessExecution(
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
  request->set_type(type);
  request->set_hostname(hostname);

  Create(request);
}
} // namespace o2::bkp::api::proto::grpc::services
