#!/bin/sh
/opt/wait-for-it.sh -t 0 test_db:3306 -- npm run test:"$TEST_TYPE"
