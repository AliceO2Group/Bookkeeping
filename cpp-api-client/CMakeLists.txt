cmake_minimum_required(VERSION 3.5.2 FATAL_ERROR)

project(
    BookkeepingApiCpp
    VERSION 0.17.3
    LANGUAGES CXX)

find_package(Doxygen)
if (DOXYGEN_FOUND)
  message("Generating Doxygen documentation for ${CMAKE_SOURCE_DIR}/src")
  set(DOXYGEN_USE_MDFILE_AS_MAINPAGE "${CMAKE_SOURCE_DIR}/README.md")
  set(DOXYGEN_GENERATE_TREEVIEW YES)
  set(DOXYGEN_HIDE_UNDOC_RELATIONS NO)
  set(DOXYGEN_HAVE_DOT YES)
  set(DOXYGEN_DOT_NUM_THREADS 1)
  set(DOXYGEN_UML_LOOK YES)
  set(DOXYGEN_UML_LIMIT_NUM_FIELDS 50)
  set(DOXYGEN_TEMPLATE_RELATIONS YES)
  set(DOXYGEN_DOT_IMAGE_FORMAT svg)
  set(DOXYGEN_INTERACTIVE_SVG YES)
  set(DOXYGEN_DOT_GRAPH_MAX_NODES 100)
  set(DOXYGEN_DOT_TRANSPARENT YES)

  doxygen_add_docs(doc
    ${CMAKE_SOURCE_DIR}/src
    ALL
    COMMENT "Generating Doxygen"
  )
endif()

if(ONLYDOC)
  return()
endif()

if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release)
endif()

# BUILD TYPE
message("A ${CMAKE_BUILD_TYPE} build configuration is detected")

# Update require components as necessary
find_package(Boost 1.45.0 REQUIRED COMPONENTS thread system regex date_time program_options filesystem)

# Find cpprest dependency
include(CMakeFindDependencyMacro)
find_dependency(cpprestsdk REQUIRED) 

# Set source files
file(GLOB SOURCES 
    "src/*.cpp"
    "src/cpprest-client/*.cpp"
    "src/cpprest-client/api/*.cpp"
    "src/cpprest-client/model/*.cpp")

# Set library
add_library(
    ${PROJECT_NAME}
    SHARED
    ${SOURCES})

# Set the paths where the files can be found
target_include_directories(
    ${PROJECT_NAME}
    PUBLIC
    $<INSTALL_INTERFACE:include>
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/src/cpprest-client>
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/src/cpprest-client/api>
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/src/cpprest-client/model>)

# Link external libraries to the project
target_link_libraries(
    ${PROJECT_NAME}
    PUBLIC
    Boost::system
    Boost::date_time
    pthread
    cpprestsdk::cpprest)

target_compile_features(
    ${PROJECT_NAME}
    PUBLIC
    cxx_std_17)

set_target_properties(${PROJECT_NAME} PROPERTIES OUTPUT_NAME "O2BookkeepingApiCpp")

# Executable for example.cpp
add_executable(
    bookkeeping-api-cpp-example
    src/Example.cpp)

target_link_libraries(
    bookkeeping-api-cpp-example
    PRIVATE
    Boost::headers
    Boost::program_options
    OpenSSL::SSL # This is a temporary workaround as the target should come from ccprestsdk
    BookkeepingApiCpp)

# Set CMAKE_INSTALL_LIBDIR explicitly to lib (to avoid lib64 on CC7)
set(CMAKE_INSTALL_LIBDIR lib)

install(
    TARGETS bookkeeping-api-cpp-example BookkeepingApiCpp
    EXPORT BookkeepingApiCppTargets
    RUNTIME DESTINATION bin
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
    ARCHIVE DESTINATION ${CMAKE_INSTALL_LIBDIR})

install(
    EXPORT BookkeepingApiCppTargets
    FILE BookkeepingApiCppTargets.cmake
    DESTINATION "${CMAKE_INSTALL_LIBDIR}/cmake/BookkeepingApiCpp")

install(
    DIRECTORY src/
    DESTINATION include/BookkeepingApiCpp
    FILES_MATCHING PATTERN "*.h")

# Configure and install package config files
include(CMakePackageConfigHelpers)

write_basic_package_version_file(
    "${CMAKE_CURRENT_BINARY_DIR}/cmake/BookkeepingApiCppConfigVersion.cmake"
    VERSION ${PACKAGE_VERSION}
    COMPATIBILITY AnyNewerVersion)

configure_package_config_file(
    cmake/BookkeepingApiCppConfig.cmake.in 
    cmake/BookkeepingApiCppConfig.cmake
    INSTALL_DESTINATION "${CMAKE_INSTALL_LIBDIR}/cmake/BookkeepingApiCpp"
    PATH_VARS CMAKE_INSTALL_PREFIX)

install(
    FILES
    "${CMAKE_CURRENT_BINARY_DIR}/cmake/BookkeepingApiCppConfig.cmake"
    "${CMAKE_CURRENT_BINARY_DIR}/cmake/BookkeepingApiCppConfigVersion.cmake"
    DESTINATION
    ${CMAKE_INSTALL_LIBDIR}/cmake/BookkeepingApiCpp)
