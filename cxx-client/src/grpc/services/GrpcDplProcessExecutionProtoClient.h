//
// Created by mboulais on 02/03/23.
//

#ifndef BOOKKEEPINGAPI_GRPCDPLPROCESSEXECUTIONPROTOCLIENT_H
#define BOOKKEEPINGAPI_GRPCDPLPROCESSEXECUTIONPROTOCLIENT_H

#include "BookkeepingApi/DplProcessExecutionProtoClient.h"
#include "dplProcessExecution.grpc.pb.h"

namespace o2::bkp::api::proto::grpc::services
{
class GrpcDplProcessExecutionProtoClient : public ::o2::bkp::api::proto::DplProcessExecutionProtoClient
{
 public:
  explicit GrpcDplProcessExecutionProtoClient(const std::shared_ptr<::grpc::ChannelInterface>& channel);

  std::shared_ptr<o2::bookkeeping::DplProcessExecution> Create(std::shared_ptr<o2::bookkeeping::DplProcessExecutionCreationRequest> request) override;

  void registerProcessExecution(
    int runNumber,
    o2::bookkeeping::DplProcessType type,
    std::string hostname,
    std::string deviceId,
    std::string args,
    std::string detector) override;

 private:
  std::unique_ptr<o2::bookkeeping::DplProcessExecutionService::Stub> mStub;
};
} // namespace o2::bkp::api::proto::grpc::services

#endif // BOOKKEEPINGAPI_GRPCDPLPROCESSEXECUTIONPROTOCLIENT_H
