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

#ifndef CXX_CLIENT_BOOKKEEPINGAPI_BOOKKEEPINGCLIENT_H_
#define CXX_CLIENT_BOOKKEEPINGAPI_BOOKKEEPINGCLIENT_H_

#include <memory>
#include "FlpServiceClient.h"

namespace o2::bookkeeping::api
{
/// Interface for bookkeeping API clients
class BookkeepingClient
{
 public:
  /// Return client for FLP service
  virtual const std::shared_ptr<FlpServiceClient> flp() const = 0;
};
} // namespace o2::bookkeeping::api

#endif // CXX_CLIENT_BOOKKEEPINGAPI_BOOKKEEPINGCLIENT_H_