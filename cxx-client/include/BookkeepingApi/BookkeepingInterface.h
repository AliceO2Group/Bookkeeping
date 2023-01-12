#ifndef CXX_CLIENT_BOOKKEEPINGCLIENT_H
#define CXX_CLIENT_BOOKKEEPINGCLIENT_H

#include <memory>
#include "BookkeepingApi/flp.pb.h"

class BookkeepingInterface {
 public:
  virtual void updateCounters(
    const std::string &flpName,
    int32_t runNumber,
    int64_t nSubtimeframes,
    int64_t nEquipmentBytes,
    int64_t nRecordingBytes,
    int64_t nFairMQBytes
  ) = 0;

  virtual void updateCountersRequest(const o2::bookkeeping::UpdateCountersRequest &request) = 0;
};

#endif