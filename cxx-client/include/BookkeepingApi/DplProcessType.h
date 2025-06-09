//
// Created by mboulais on 22/04/24.
//

#ifndef CXX_CLIENT_BOOKKEEPINGAPI_DPLPROCESSTYPE_H
#define CXX_CLIENT_BOOKKEEPINGAPI_DPLPROCESSTYPE_H

namespace o2::bkp
{
// Enum values map the proto values, and will map to pb generated file without need for conversion
enum class DplProcessType {
  _NULL = 0,
  QC_TASK = 1,
  QC_CHECKER = 2,
  QC_AGGREGATOR = 3,
  QC_POSTPROCESSING = 4,
  DISPATCHER = 5,
  MERGER = 6,
};
} // namespace o2::bkp

#endif // CXX_CLIENT_BOOKKEEPINGAPI_DPLPROCESSTYPE_H
