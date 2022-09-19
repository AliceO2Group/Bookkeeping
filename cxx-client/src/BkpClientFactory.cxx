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

#include "BookkeepingApi/BkpClientFactory.h"
#include <memory>
#include "grpc/GrpcBkpClient.h"

using std::make_unique;
using std::string;
using std::unique_ptr;

namespace o2::bkp::api
{
unique_ptr<BkpClient> BkpClientFactory::create(const string& gRPCUri, const string& token)
{
  return make_unique<grpc::GrpcBkpClient>(gRPCUri, token);
}
} // namespace o2::bkp::api
