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
// Created by mboulais on 27/05/24.
//

#ifndef CXX_CLIENT_BOOKKEEPINGAPI_QCFLAGSSERVICECLIENT_H
#define CXX_CLIENT_BOOKKEEPINGAPI_QCFLAGSSERVICECLIENT_H

#include <vector>
#include <string>
#include <cstdint>
#include "QcFlag.h"

namespace o2::bkp::api
{
class QcFlagServiceClient
{
 public:
  virtual ~QcFlagServiceClient() = default;

  /// Create a list of new QC flag for a given data pass, run and detector
  virtual std::vector<int> createForDataPass(
    uint32_t runNumber,
    const std::string& passName,
    const std::string& detectorName,
    const std::vector<QcFlag>& qcFlags) = 0;

  /// Create a list of new QC flag for a given data pass, run and detector
  virtual std::vector<int> createForSimulationPass(
    uint32_t runNumber,
    const std::string& productionName,
    const std::string& detectorName,
    const std::vector<QcFlag>& qcFlags) = 0;
};
} // namespace o2::bkp::api

#endif // CXX_CLIENT_BOOKKEEPINGAPI_QCFLAGSSERVICECLIENT_H
