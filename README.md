# Bookkeeping
This repository contains the software for ALICE Bookkeeping whose main purpose is to keep track of the experiment and provide a history state of the system

Bookkeeping allows users to manually insert system updates which then can be filtered and retrieved to quickly access the information they are looking for. Moreover, it provides the means to other systems to enable them to automatically store and retrieve data. Based on the input, it builds global and individual statistics about  the system performances which in turn helps improving the overall  efficiency of the experiment.

## Installation instructions

What is your use case?

### A. :arrow_right: I want to use Bookkeeping and other O<sup>2</sup> Components.

In order to deploy a fully operational O<sup>2</sup> FLP Suite, please use these [instructions](https://alice-flp.docs.cern.ch/system-configuration/utils/o2-flp-setup/). 

For support, please contact alice-o2-flp-support@cern.ch

### B. :telescope: I want to use Bookkeeping and connect it to other systems already deployed

You can deploy Bookkeeping on your own setup by following our [SETUP](/docs/setup.md) guide.

### C. :hammer_and_wrench: I want to contribute to Bookkeeping software

You are more than welcomed to contribute to Bookkeeping. Please fellow our [CONTRIBUTING](./docs/CONTRIBUTING.md) guide where you can find out more about how to set up a dev environment and how to follow our coding standards.

## Bookkeeping Requests

If you would like to see a new feature in Bookkeeping, please raise a JIRA ticket and explain the use-case you envisage and why the feature is needed. [JIRA Board](https://alice.its.cern.ch/jira/secure/RapidBoard.jspa?projectKey=O2B)

## Bookkeeping Status
GitHub Actions: ![Status](https://github.com/AliceO2Group/Bookkeeping/actions/workflows/bookkeeping.yml/badge.svg)