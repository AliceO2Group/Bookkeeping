//
// Created by mboulais on 02/03/23.
//

#ifndef BOOKKEEPINGAPI_GRPCBKPPROTOCLIENT_H
#define BOOKKEEPINGAPI_GRPCBKPPROTOCLIENT_H

#include "BookkeepingApi/BkpProtoClient.h"

namespace o2::bkp::api::proto::grpc
{
class GrpcBkpProtoClient : public BkpProtoClient
{
 public:
  explicit GrpcBkpProtoClient(const std::string& uri);
  ~GrpcBkpProtoClient() override = default;

  const std::unique_ptr<RunProtoClient>& run() const override;

  const std::unique_ptr<DplProcessExecutionProtoClient>& dplProcessExecution() const override;

 private:
  std::unique_ptr<::o2::bkp::api::proto::RunProtoClient> mRunClient;
  std::unique_ptr<::o2::bkp::api::proto::DplProcessExecutionProtoClient> mDplProcessExecutionClient;
};
} // namespace o2::bkp::api::proto

#endif // BOOKKEEPINGAPI_GRPCBKPPROTOCLIENT_H
