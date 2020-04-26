#!/usr/bin/env bash

BASE_NAME="aliceo2-bookkeeping"
TARGETS="production development test"

# Build and tag all targets
for target in $TARGETS; do
    echo "docker build . --tag $BASE_NAME-$target --target $target" | sh
done

# Print image sizes of the just created targets
echo "docker images | grep $BASE_NAME | sort" | sh
