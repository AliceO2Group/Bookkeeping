cmake_minimum_required(VERSION 3.20)

project(BookkeepingApi
        VERSION 0.76.0
        LANGUAGES CXX
)

find_package(protobuf CONFIG REQUIRED)
find_package(gRPC REQUIRED)

set(CMAKE_POSITION_INDEPENDENT_CODE ON)
set(CMAKE_INSTALL_LIBDIR lib)
set(LIBRARY_OUTPUT_PATH "${CMAKE_BINARY_DIR}/lib")
set(EXECUTABLE_OUTPUT_PATH "${CMAKE_BINARY_DIR}/bin")
set(INCLUDE_OUTPUT_DIRECTORY "${PROJECT_BINARY_DIR}/include")
set(CMAKE_BUILD_TYPE "RelWithDebInfo")

# Generating c++ proto bindings and gRPC from proto files

get_filename_component(PROTO_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../proto ABSOLUTE)
set(PROTO_OUT_DIR "${CMAKE_CURRENT_BINARY_DIR}")

add_library(BookkeepingProtos OBJECT
        ${PROTO_DIR}/common.proto
        ${PROTO_DIR}/flp.proto
        ${PROTO_DIR}/run.proto
        ${PROTO_DIR}/dplProcessExecution.proto
)

target_link_libraries(BookkeepingProtos
        PUBLIC protobuf::libprotobuf
        PRIVATE gRPC::grpc++
)

target_include_directories(BookkeepingProtos PUBLIC
        "$<BUILD_INTERFACE:${PROTO_OUT_DIR}>"
)

protobuf_generate(
        TARGET BookkeepingProtos
        IMPORT_DIRS "${PROTO_DIR}"
        PROTOC_OUT_DIR "${PROTO_OUT_DIR}"
)

protobuf_generate(
        TARGET BookkeepingProtos
        LANGUAGE grpc
        GENERATE_EXTENSIONS .grpc.pb.h .grpc.pb.cc
        PLUGIN "protoc-gen-grpc=\$<TARGET_FILE:gRPC::grpc_cpp_plugin>"
        IMPORT_DIRS ${PROTO_DIR}
        PROTOC_OUT_DIR "${PROTO_OUT_DIR}"
)

### LIBRARY

add_library(BookkeepingApi SHARED
        src/grpc/GrpcBkpClient.cxx
        src/grpc/services/GrpcFlpServiceClient.cxx
        src/BkpClientFactory.cxx
)

target_include_directories(BookkeepingApi
        PUBLIC $<INSTALL_INTERFACE:include>    # public header once installed
        $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include> # to build it
        PRIVATE $<BUILD_INTERFACE:${PROTO_OUT_DIR}> # because of the proto generated files
        $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/src> # private headers
)

target_link_libraries(BookkeepingApi
        PRIVATE BookkeepingProtos
        PRIVATE protobuf::libprotobuf
        PRIVATE gRPC::grpc++
)

target_compile_features(BookkeepingApi PUBLIC cxx_std_17)

add_library(BookkeepingProtoApi SHARED
        src/BkpProtoClientFactory.cxx
        src/grpc/GrpcBkpProtoClient.cxx
        src/grpc/services/GrpcRunProtoClient.cxx
        src/grpc/services/GrpcDplProcessExecutionProtoClient.cxx
)

target_include_directories(BookkeepingProtoApi
        PUBLIC $<INSTALL_INTERFACE:include>    # public header once installed
        $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include> # to build it
        PRIVATE $<BUILD_INTERFACE:${PROTO_OUT_DIR}> # because of the proto generated files
        $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/src> # private headers
)

target_link_libraries(BookkeepingProtoApi
        PUBLIC BookkeepingProtos
        PUBLIC protobuf::libprotobuf
        PRIVATE gRPC::grpc++
)

target_compile_features(BookkeepingProtoApi PUBLIC cxx_std_17)

### EXAMPLES

add_executable(exampleSpecificService example/exampleSpecificServices.cxx)

target_link_libraries(exampleSpecificService
        PUBLIC BookkeepingApi
)

add_executable(exampleProtoService example/exampleProtoServices.cxx)

target_link_libraries(exampleProtoService
        PUBLIC BookkeepingProtoApi
)

target_include_directories(exampleProtoService PRIVATE $<BUILD_INTERFACE:${PROTO_OUT_DIR}>)

# PACKAGE INFO

include(CMakePackageConfigHelpers)

write_basic_package_version_file(${CMAKE_PROJECT_NAME}ConfigVersion.cmake
        VERSION ${${CMAKE_PROJECT_NAME}_VERSION}
        COMPATIBILITY SameMajorVersion)

configure_package_config_file(cmake/${CMAKE_PROJECT_NAME}Config.cmake.in
        "${CMAKE_CURRENT_BINARY_DIR}/${CMAKE_PROJECT_NAME}Config.cmake"
        INSTALL_DESTINATION
        "${CMAKE_INSTALL_LIBDIR}/cmake/${CMAKE_PROJECT_NAME}")

### INSTALL
install(FILES
        ${PROTO_OUT_DIR}/common.pb.h
        ${PROTO_OUT_DIR}/flp.pb.h
        ${PROTO_OUT_DIR}/run.pb.h
        ${PROTO_OUT_DIR}/dplProcessExecution.pb.h
        DESTINATION "include"
)

install(TARGETS BookkeepingProtos BookkeepingApi BookkeepingProtoApi
        EXPORT BookkeepingApiTargets
        LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
        ARCHIVE DESTINATION ${CMAKE_INSTALL_LIBDIR}
        RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
)

# Install headers
install(DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/include/BookkeepingApi
        DESTINATION "include")

install(FILES ${CMAKE_CURRENT_BINARY_DIR}/${CMAKE_PROJECT_NAME}Config.cmake
        ${CMAKE_CURRENT_BINARY_DIR}/${CMAKE_PROJECT_NAME}ConfigVersion.cmake
        DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/${CMAKE_PROJECT_NAME})

# Export targets
install(EXPORT BookkeepingApiTargets
        FILE BookkeepingApiTargets.cmake
        NAMESPACE AliceO2::
        DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/BookkeepingApi
)
