#ifndef CXX_CLIENT_BOOKKEEPINGIMPL_H
#define CXX_CLIENT_BOOKKEEPINGIMPL_H

#include <memory>
#include "BookkeepingApi/flp.grpc.pb.h"
#include "BookkeepingApi/BookkeepingInterface.h"

class BookkeepingImpl : public BookkeepingInterface {
 public:
  BookkeepingImpl(const std::string& url);
  ~BookkeepingImpl() = default;

  void updateCounters(
    const std::string &flpName,
    int32_t runNumber,
    int64_t nSubtimeframes,
    int64_t nEquipmentBytes,
    int64_t nRecordingBytes,
    int64_t nFairMQBytes
  );

  void updateCountersRequest(const o2::bookkeeping::UpdateCountersRequest &request);

 private:
  std::unique_ptr<o2::bookkeeping::FlpService::Stub> mStub;
};

#endif