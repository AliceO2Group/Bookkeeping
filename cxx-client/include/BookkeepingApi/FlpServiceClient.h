//  Copyright 2019-2020 CERN and copyright holders of ALICE O2.
//  See https://alice-o2.web.cern.ch/copyright for details of the copyright holders.
//  All rights not expressly granted are reserved.
//
//  This software is distributed under the terms of the GNU General Public
//  License v3 (GPL Version 3), copied verbatim in the file "COPYING".
//
//  In applying this license CERN does not waive the privileges and immunities
//  granted to it by virtue of its status as an Intergovernmental Organization
//  or submit itself to any jurisdiction.

//
// Created by martin on 12/01/23.
//

#ifndef CXX_CLIENT_BOOKKEEPINGAPI_FLPSERVICECLIENT_H_
#define CXX_CLIENT_BOOKKEEPINGAPI_FLPSERVICECLIENT_H_

#include <string>

namespace o2::bkp::api
{
class FlpServiceClient
{
 public:
  virtual ~FlpServiceClient() = default;

  /// Update counters for a given flp, identified by its name and its run number
  virtual void updateReadoutCountersByFlpNameAndRunNumber(
    const std::string& flpName,
    int32_t runNumber,
    uint64_t nSubtimeframes,
    uint64_t nEquipmentBytes,
    uint64_t nRecordingBytes,
    uint64_t nFairMQBytes) = 0;
};
} // namespace o2::bkp::api

#endif // CXX_CLIENT_BOOKKEEPINGAPI_FLPSERVICECLIENT_H_
