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

#ifndef CXX_CLIENT_BOOKKEEPINGAPI_RUNSERVICECLIENT_H
#define CXX_CLIENT_BOOKKEEPINGAPI_RUNSERVICECLIENT_H

#include <string>

namespace o2::bkp::api
{
class RunServiceClient
{
 public:
  virtual ~RunServiceClient() = default;

  virtual void setRawCtpTriggerConfiguration(int runNumber, std::string rawCtpTriggerConfiguration) = 0;
};
} // namespace o2::bkp::api

#endif // CXX_CLIENT_BOOKKEEPINGAPI_RUNSERVICECLIENT_H
