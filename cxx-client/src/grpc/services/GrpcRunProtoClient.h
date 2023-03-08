//
// Created by mboulais on 02/03/23.
//

#ifndef BOOKKEEPINGAPI_GRPCRUNPROTOCLIENT_H
#define BOOKKEEPINGAPI_GRPCRUNPROTOCLIENT_H

#include "BookkeepingApi/RunProtoClient.h"
#include "run.grpc.pb.h"

namespace o2::bkp::api::proto::grpc::services
{
class GrpcRunProtoClient : public ::o2::bkp::api::proto::RunProtoClient
{
 public:
  explicit GrpcRunProtoClient(const std::shared_ptr<::grpc::ChannelInterface>& channel);

  std::shared_ptr<o2::bookkeeping::RunWithRelations> Get(const int runNumber, const std::vector<o2::bookkeeping::RunRelations>& relations) override;
  std::shared_ptr<o2::bookkeeping::RunWithRelations> Get(std::shared_ptr<o2::bookkeeping::RunFetchRequest> request) override;

 private:
  std::unique_ptr<o2::bookkeeping::RunService::Stub> mStub;
};
} // namespace o2::bkp::api::proto

#endif // BOOKKEEPINGAPI_GRPCRUNPROTOCLIENT_H
