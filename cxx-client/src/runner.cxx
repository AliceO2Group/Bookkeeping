#include <stdexcept>
#include <iostream>
#include <sstream>
#include "BookkeepingApi/BookkeepingClientFactory.h"

using namespace o2::bookkeeping::api;

int main(int argc, char** argv)
{
  if (argc < 2) {
    std::cerr << "You need to provide path to the configuration as first argument" << std::endl << std::endl;
    exit(1);
  }

  try {
    // Let Configuration check for file validity which goes out of this example
    // Configuration file must provide the bookkeeping gRPC endpoint's URL in the key `o2.bookkeeping.grpc-url`
    std::stringstream ss;
    ss << "json://" << argv[1];
    auto client = BookkeepingClientFactory::fromConfiguration(ss.str());
    client->flp()->updateReadoutCountersByFlpNameAndRunNumber("FLP-TPC-1", 1, 2, 2, 2, 2);
  } catch (std::runtime_error& error) {
    std::cout << "An error occurred: " << error.what() << std::endl;
    exit(2);
  }

  return 0;
}
