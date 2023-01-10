//
// Created by Barthélémy von Haller on 10.01.23.
//

#ifndef CXX_CLIENT_BOOKKEEPINGFACTORY_H
#define CXX_CLIENT_BOOKKEEPINGFACTORY_H

#include "BookkeepingApi/BookkeepingInterface.h"

class BookkeepingFactory
{
 public:
  BookkeepingFactory() = delete;

  static std::shared_ptr<BookkeepingInterface> createClient(const std::string& url);
};

#endif // CXX_CLIENT_BOOKKEEPINGFACTORY_H
