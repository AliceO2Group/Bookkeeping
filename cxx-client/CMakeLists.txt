cmake_minimum_required(VERSION 3.20)

project(BookkeepingApi
    VERSION 0.0.1
    LANGUAGES CXX
)

find_package(Protobuf CONFIG REQUIRED)
find_package(gRPC CONFIG REQUIRED)

set(CMAKE_INSTALL_LIBDIR lib)
set(LIBRARY_OUTPUT_PATH "${CMAKE_BINARY_DIR}/lib")
set(EXECUTABLE_OUTPUT_PATH "${CMAKE_BINARY_DIR}/bin")
set(INCLUDE_OUTPUT_DIRECTORY "${PROJECT_BINARY_DIR}/include")
set(CMAKE_BUILD_TYPE "RelWithDebInfo")

set(PROTO_FILE ${CMAKE_CURRENT_SOURCE_DIR}/../proto/flp.proto)
get_filename_component(PROTO_OUTPUT_NAME ${PROTO_FILE} NAME_WE)
get_filename_component(PROTO_FILE_PREFIX ${PROTO_FILE} PATH)
set(PROTO_CPP_OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/${PROTO_OUTPUT_NAME}.pb.cc)
set(GRPC_CPP_OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/${PROTO_OUTPUT_NAME}.grpc.pb.cc)

add_custom_command(
    OUTPUT "${PROTO_CPP_OUTPUT}"
    COMMAND protobuf::protoc
    ARGS --proto_path ${PROTO_FILE_PREFIX}
         --cpp_out ${CMAKE_CURRENT_BINARY_DIR}
         ${PROTO_OUTPUT_NAME}.proto
    DEPENDS ${PROTO_FILE}
    COMMENT "Running protoc on ${PROTO_FILE}"
    VERBATIM
)

add_custom_command(
    OUTPUT "${GRPC_CPP_OUTPUT}"
    COMMAND protobuf::protoc
    ARGS --proto_path ${PROTO_FILE_PREFIX}
         --grpc_out=${CMAKE_CURRENT_BINARY_DIR}
         --plugin=protoc-gen-grpc=$<TARGET_FILE:gRPC::grpc_cpp_plugin>
         ${PROTO_OUTPUT_NAME}.proto
    DEPENDS ${PROTO_FILE}
    COMMENT "Running protoc/gRPC on ${PROTO_FILE}"
    VERBATIM
)

### LIBRARY

set(library_name BookkeepingApi)

add_library(${library_name}
  src/BookkeepingImpl.cxx
  src/BookkeepingFactory.cxx
  ${PROTO_CPP_OUTPUT}
  ${GRPC_CPP_OUTPUT}
)

target_include_directories(${library_name}
  PUBLIC $<INSTALL_INTERFACE:include>    # public header once installed
  PUBLIC $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include> # to build it
  PRIVATE $<BUILD_INTERFACE:${CMAKE_CURRENT_BINARY_DIR}> # because of the proto generated files
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/src> # private headers
)

target_link_libraries(
  ${library_name}
  PRIVATE
    gRPC::grpc++
    protobuf::libprotobuf
)

### EXECUTABLE

add_executable(runner src/runner.cxx)

target_link_libraries(runner
  PUBLIC
  ${library_name}
  )


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

install(TARGETS ${library_name} runner
  EXPORT ${library_name}Targets
  LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
  ARCHIVE DESTINATION ${CMAKE_INSTALL_LIBDIR}
  RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
#  PUBLIC_HEADER DESTINATION include
)

# Install headers
install(DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/include/BookkeepingApi
  DESTINATION "include")

install(FILES ${CMAKE_CURRENT_BINARY_DIR}/${CMAKE_PROJECT_NAME}Config.cmake
  ${CMAKE_CURRENT_BINARY_DIR}/${CMAKE_PROJECT_NAME}ConfigVersion.cmake
  DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/${CMAKE_PROJECT_NAME})

# Export targets
install(EXPORT ${library_name}Targets
  FILE ${library_name}Targets.cmake
  NAMESPACE ${library_name}::
  DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/${library_name}
  )