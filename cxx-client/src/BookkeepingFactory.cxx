//
// Created by Barthélémy von Haller on 10.01.23.
//

#include "BookkeepingApi/BookkeepingFactory.h"
#include "BookkeepingImpl.h"

std::shared_ptr<BookkeepingInterface> BookkeepingFactory::createClient(const std::string& url)
{
  return std::make_shared<BookkeepingImpl>(url);
}