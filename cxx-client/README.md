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

### Cmake

In order to use the client in your application you need to link the library with your executables. For example if you
have only one executable you can add:

```cmake
find_package(BookkeepingApi)
target_link_libraries(${EXECUTABLE_NAME} PRIVATE BookkeepingApi::BookkeepingApi)
```

The bookkeeping API's client can be requested form the factory based on a configuration URI:

```cpp
#include "<BookkeepingApi/BookkeepingClientFactory.h>"
using namespace o2::bookkeeping:api;

auto client = BookkeepingClientFactory::fromConfiguration("consul://[host][:port]");
```

Then the client provide access to services which group API calls by context, for example `flp`, `run` and so on.

For example to update readout FLP's counters using a local JSON file you can use

```cpp
#include "<BookkeepingApi/BookkeepingClientFactory.h>"
using namespace o2::bookkeeping:api;

auto client = BookkeepingClientFactory::fromConfiguration("json://[path-to-configuration-file]");
client->flp()->updateReadoutCountersByFlpNameAndRunNumber("FLP-NAME", runNumber, nSubtimeframes, nEquipmentBytes, nRecordingBytes, nFairMQBytes);
```

**Both the client creation and service calls may throw `std::runtime_error` that should be caught**
