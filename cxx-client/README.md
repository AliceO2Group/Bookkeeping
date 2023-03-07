# Bookkeeping API module

## Installation

### aliBuild installation

Follow [this](https://alice-doc.github.io/alice-analysis-tutorial/building/) tutorial to install `aliBuild`.

First of all, you need to add a dependency on `bookkeeping-api` in alidist.
Then, install `BookkeepingApi` module in your working directory:

```
aliBuild build bookkeeping-api
alienv load bookkeeping-api/latest
```

##### Development

If you want to make changes to the source code initialise the development package first:

```
aliBuild init bookkeeping-api@master
```

and then load the environment using `alienv` and use `make` to recompile

```
alienv enter bookkeeping-api/latest
cd sw/BUILD/bookkeeping-api-latest/bookkeeping-api
make -j install
```

## Usage

The bookkeeping API is split in two different targets:

- `BookkeepingApi` that has no dependency and provide use-case specific functions
- `BookkeepingProtoApi` that provides direct implementations of the services defined in the proto
  Please note that this target depends on google's protocol buffers in order to be used

### Cmake

In order to use the client in your application you need to link the library with your executables. For example if you
have only one executable you can add:

```cmake
# In any case
find_package(BookkeepingApi)

# Use-case specific services
target_link_libraries(${EXECUTABLE_NAME} PRIVATE AliceO2::BookkeepingApi)

# Or proto services implementation
target_link_libraries(${EXECUTABLE_NAME} PRIVATE AliceO2::BookkeepingProtoApi)

# Or both
target_link_libraries(${EXECUTABLE_NAME} PRIVATE AliceO2::BookkeepingProtoApi AliceO2::BookkeepingApi)
```
### C++ usage

The bookkeeping API's client can be requested from one of the two available factories by providing it the gRPC endpoint's URI:

#### Use-case specific services

```cpp
#include <BookkeepingApi/BkpClientFactory.h>
using namespace o2::bkp::api;

auto client = BkpClientFactory::create("[host][:port]");
```

If you have a local bookkeeping running, the URI should be `127.0.0.1:4001` (note the **absence** of protocol such
as `https://`).


Then the clients provides access to services which group API calls by context, for example `flp`, `run` and so on.

For example to update readout FLP's counters using a local JSON file you can use

```cpp
#include <BookkeepingApi/BkpClientFactory.h>
using namespace o2::bkp::api;

auto client = BkpClientFactory::create("[grpc-endpoint-url]");
client->flp()->updateReadoutCountersByFlpNameAndRunNumber("FLP-NAME", runNumber, nSubtimeframes, nEquipmentBytes, nRecordingBytes, nFairMQBytes);
```

#### Proto services implementations

```cpp
#include <BookkeepingApi/BkpProtoClientFactory.h>
using namespace o2::bkp::api::proto;

auto client = BkpProtoClientFactory::create("[host][:port]");
```

If you have a local bookkeeping running, the URI should be `127.0.0.1:4001` (note the **absence** of protocol such
as `https://`).

Then the clients provides services implementations by the service name. For example, the implementation of the service `RunService` is available through `run()`.

For example to fetch a run by its id one can use:

```cpp
#include <BookkeepingApi/BkpProtoClientFactory.h>
using namespace o2::bkp::api::proto;

auto client = BkpProtoClientFactory::create("[grpc-endpoint-url]");

// First option: direct implementation, using constructed request
auto request = std::make_shared<RunFetchRequest>();
request->set_runnumber(106);
std::shared_ptr<o2::bookkeeping::Run> run106 = client->run()->Get(request);
std::cout << "Retrieved run 106 info, such as time o2 start" << run106->timeo2start() << std::endl;

// Second option: use shortcut when a request can be reduced to a single builtin type argument
std::shared_ptr<o2::bookkeeping::Run> run105 = client->run()->Get(105);
std::cout << "Retrieved run 105 info, such as time o2 start" << run105->timeo2start() << std::endl;

```

**Both the client creation and service calls may throw `std::runtime_error` that should be caught**
