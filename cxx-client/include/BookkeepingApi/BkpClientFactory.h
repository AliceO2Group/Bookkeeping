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
// Created by Barthélémy von Haller on 10.01.23.
//

#ifndef CXX_CLIENT_BOOKKEEPINGAPI_BKPCLIENTFACTORY_H
#define CXX_CLIENT_BOOKKEEPINGAPI_BKPCLIENTFACTORY_H

#include "BookkeepingApi/BkpClient.h"

namespace o2::bkp::api
{
/// Abstract factory for bookkeeping API clients
class BkpClientFactory
{
 public:
  BkpClientFactory() = delete;

  /// Provides a Bookkeeping API client configured from a given configuration URI using an authentication token
  static std::unique_ptr<BkpClient> create(const std::string& gRPCUri, const std::string& token);
};
} // namespace o2::bkp::api

#endif // CXX_CLIENT_BOOKKEEPINGAPI_BKPCLIENTFACTORY_H
