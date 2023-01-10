#ifndef CXX_CLIENT_BOOKKEEPINGCLIENT_H
#define CXX_CLIENT_BOOKKEEPINGCLIENT_H

#include <memory>

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
};

#endif