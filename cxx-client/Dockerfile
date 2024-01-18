FROM registry.access.redhat.com/ubi8/ubi-minimal:8.9

RUN ["microdnf",  "install", "cmake", "llvm-toolset", "git"]

WORKDIR /usr/lib
RUN ["git", "clone", "--recurse-submodules", "-b", "v1.60.0", "--depth", "1", "--shallow-submodules", "https://github.com/grpc/grpc"]

WORKDIR grpc/cmake/build
RUN ["cmake", "-DgRPC_INSTALL=ON", "-DgRPC_BUILD_TESTS=OFF", "../.."]
RUN ["make", "-j", "8"]
RUN ["make", "install"]

WORKDIR /usr/src/proto
COPY ./proto .

WORKDIR /usr/src/cxx-client
COPY ./cxx-client .
RUN ["cmake", "-B", "build", "-S", "."]

WORKDIR build
RUN ["make", "-j", "8"]
