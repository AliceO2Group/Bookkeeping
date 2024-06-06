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

#ifndef CXX_CLIENT_BOOKKEEPINGAPI_BOOKKEEPINGAPI_QCFLAG_H
#define CXX_CLIENT_BOOKKEEPINGAPI_BOOKKEEPINGAPI_QCFLAG_H

#include <cstdint>
#include <string>
#include <optional>
struct QcFlag {
  uint32_t flagTypeId;
  std::optional<uint64_t> from;
  std::optional<uint64_t> to;
  std::string origin;
  std::optional<std::string> comment;
};

#endif // CXX_CLIENT_BOOKKEEPINGAPI_BOOKKEEPINGAPI_QCFLAG_H
