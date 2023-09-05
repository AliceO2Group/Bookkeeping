cmake_minimum_required(VERSION 3.20)

project(BookkeepingApi
    VERSION 0.0.1
    LANGUAGES CXX
)

find_package(Protobuf CONFIG REQUIRED)
find_package(gRPC REQUIRED)

set(CMAKE_INSTALL_LIBDIR lib)
set(LIBRARY_OUTPUT_PATH "${CMAKE_BINARY_DIR}/lib")
set(EXECUTABLE_OUTPUT_PATH "${CMAKE_BINARY_DIR}/bin")
set(INCLUDE_OUTPUT_DIRECTORY "${PROJECT_BINARY_DIR}/include")
set(CMAKE_BUILD_TYPE "RelWithDebInfo")

# Generating c++ proto bindings and gRPC from proto files

get_filename_component(PROTO_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/../proto ABSOLUTE)

set(PROTO_FILES "")
set(PROTO_OUTPUT_NAMES "")
set(PROTO_CPP_OUTPUT "")
set(GRPC_CPP_OUTPUT "")
set(PROTO_GENERATED_HEADERS_SRC "")

foreach(PROTO_NAME common flp run dplProcessExecution)
    set(PROTO_FILE ${PROTO_DIRECTORY}/${PROTO_NAME}.proto)
    get_filename_component(PROTO_OUTPUT_NAME ${PROTO_FILE} NAME_WE)
    list(APPEND PROTO_FILES ${PROTO_FILE})
    list(APPEND PROTO_OUTPUT_NAMES ${PROTO_OUTPUT_NAME}.proto)
    list(APPEND PROTO_CPP_OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/${PROTO_OUTPUT_NAME}.pb.cc)
    list(APPEND GRPC_CPP_OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/${PROTO_OUTPUT_NAME}.grpc.pb.cc)
    list(APPEND PROTO_GENERATED_HEADERS_SRC ${CMAKE_CURRENT_BINARY_DIR}/${PROTO_OUTPUT_NAME}.pb.h)
endforeach()

add_custom_command(
    OUTPUT ${PROTO_CPP_OUTPUT} ${GRPC_CPP_OUTPUT}
    COMMAND protobuf::protoc
    ARGS --proto_path ${PROTO_DIRECTORY}
         --cpp_out ${CMAKE_CURRENT_BINARY_DIR}
         --grpc_out ${CMAKE_CURRENT_BINARY_DIR}
         --plugin=protoc-gen-grpc=$<TARGET_FILE:gRPC::grpc_cpp_plugin>
         ${PROTO_OUTPUT_NAMES}
    DEPENDS ${PROTO_FILES}
    COMMENT "Running protoc on ${PROTO_FILES}"
    VERBATIM
)

### LIBRARY

add_library(BookkeepingApi SHARED
    src/grpc/GrpcBkpClient.cxx
    src/grpc/services/GrpcFlpServiceClient.cxx
    src/BkpClientFactory.cxx

    ${PROTO_CPP_OUTPUT}
    ${GRPC_CPP_OUTPUT}
)

target_include_directories(BookkeepingApi
    PUBLIC $<INSTALL_INTERFACE:include>    # public header once installed
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include> # to build it
    PRIVATE $<BUILD_INTERFACE:${CMAKE_CURRENT_BINARY_DIR}> # because of the proto generated files
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/src> # private headers
)

target_link_libraries(BookkeepingApi
    PRIVATE protobuf::libprotobuf
            gRPC::grpc++
)

target_compile_features(BookkeepingApi PUBLIC cxx_std_17)

add_library(BookkeepingProtoApi SHARED
    src/BkpProtoClientFactory.cxx
    src/grpc/GrpcBkpProtoClient.cxx
    src/grpc/services/GrpcRunProtoClient.cxx
    src/grpc/services/GrpcDplProcessExecutionProtoClient.cxx

    ${PROTO_CPP_OUTPUT}
    ${GRPC_CPP_OUTPUT}
)

target_include_directories(BookkeepingProtoApi
    PUBLIC $<INSTALL_INTERFACE:include>    # public header once installed
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include> # to build it
    PRIVATE $<BUILD_INTERFACE:${CMAKE_CURRENT_BINARY_DIR}> # because of the proto generated files
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/src> # private headers
)

target_link_libraries(BookkeepingProtoApi
    PUBLIC protobuf::libprotobuf
    PRIVATE gRPC::grpc++
)

target_compile_features(BookkeepingProtoApi PUBLIC cxx_std_17)

### EXAMPLES

add_executable(exampleSpecificService example/exampleSpecificServices.cxx)

target_link_libraries(exampleSpecificService
    PUBLIC
    BookkeepingApi
)

add_executable(exampleProtoService example/exampleProtoServices.cxx)

target_link_libraries(exampleProtoService
    PUBLIC
    BookkeepingProtoApi
)

target_include_directories(exampleProtoService PRIVATE $<BUILD_INTERFACE:${CMAKE_CURRENT_BINARY_DIR}>)

# PACKAGE INFO

include(CMakePackageConfigHelpers)

write_basic_package_version_file(${CMAKE_PROJECT_NAME}ConfigVersion.cmake
  VERSION ${${CMAKE_PROJECT_NAME}_VERSION}
  COMPATIBILITY SameMajorVersion)

configure_package_config_file(cmake/${CMAKE_PROJECT_NAME}Config.cmake.in
  "${CMAKE_CURRENT_BINARY_DIR}/${CMAKE_PROJECT_NAME}Config.cmake"
  INSTALL_DESTINATION
  "${CMAKE_INSTALL_LIBDIR}/cmake/${CMAKE_PROJECT_NAME}")

#configure_package_config_file(cmake/BookkeepingProtoApiConfig.cmake.in
#    "${CMAKE_CURRENT_BINARY_DIR}/BookkeepingProtoApiConfig.cmake"
#    INSTALL_DESTINATION
#    "${CMAKE_INSTALL_LIBDIR}/cmake/BookkeepingProtoApi")

### INSTALL

# Install proto files
install(FILES ${PROTO_GENERATED_HEADERS_SRC}
    DESTINATION include/BookkeepingApi
)

install(TARGETS BookkeepingApi BookkeepingProtoApi
  EXPORT BookkeepingApiTargets
  LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
  ARCHIVE DESTINATION ${CMAKE_INSTALL_LIBDIR}
  RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
)

#install(TARGETS BookkeepingProtoApi
#    EXPORT BookkeepingProtoApiTargets
#    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
#    ARCHIVE DESTINATION ${CMAKE_INSTALL_LIBDIR}
#    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
#)

# Install headers
install(DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/include/BookkeepingApi
  DESTINATION "include")

install(FILES ${CMAKE_CURRENT_BINARY_DIR}/${CMAKE_PROJECT_NAME}Config.cmake
  ${CMAKE_CURRENT_BINARY_DIR}/${CMAKE_PROJECT_NAME}ConfigVersion.cmake
  DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/${CMAKE_PROJECT_NAME})

#install(FILES ${CMAKE_CURRENT_BINARY_DIR}/BookkeepingProtoApiConfig.cmake
#    ${CMAKE_CURRENT_BINARY_DIR}/${CMAKE_PROJECT_NAME}ConfigVersion.cmake
#    DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/BookkeepingProtoApiConfig)

# Export targets
install(EXPORT BookkeepingApiTargets
  FILE BookkeepingApiTargets.cmake
  NAMESPACE AliceO2::
  DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/BookkeepingApi
)

#install(EXPORT BookkeepingProtoApiTargets
#    FILE BookkeepingProtoApiTargets.cmake
#    NAMESPACE AliceO2::
#    DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/BookkeepingProtoApi
#)
