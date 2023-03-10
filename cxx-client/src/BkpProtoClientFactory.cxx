#include "BookkeepingApi/BkpProtoClientFactory.h"
#include "grpc/GrpcBkpProtoClient.h"

namespace o2::bkp::api::proto
{
std::unique_ptr<BkpProtoClient> BkpProtoClientFactory::create(const std::string& gRPCUri)
{
  return std::make_unique<grpc::GrpcBkpProtoClient>(gRPCUri);
}
}; // namespace o2::bkp::api