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

#ifndef CXX_CLIENT_BOOKKEEPINGAPI_BKPCLIENT_H_
#define CXX_CLIENT_BOOKKEEPINGAPI_BKPCLIENT_H_

#include <memory>
#include "FlpServiceClient.h"
#include "DplProcessExecutionClient.h"
#include "QcFlagServiceClient.h"

namespace o2::bkp::api
{
/// Interface for bookkeeping API clients
class BkpClient
{
 public:
  virtual ~BkpClient() = default;

  /// Return the client for FLP service
  virtual const std::unique_ptr<FlpServiceClient>& flp() const = 0;

  /// Returns the implementation of the DPL process execution service defined in dpl-process-execution.proto
  virtual const std::unique_ptr<DplProcessExecutionClient>& dplProcessExecution() const = 0;

  /// Returns the client for QcFlag service
  virtual const std::unique_ptr<QcFlagServiceClient>& qcFlag() const = 0;
};
} // namespace o2::bkp::api

#endif // CXX_CLIENT_BOOKKEEPINGAPI_BKPCLIENT_H_