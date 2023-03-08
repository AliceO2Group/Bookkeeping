# Contributing to AliceO2 Bookkeeping
We would love for you to contribute to *AliceO2 Bookkeeping* and help make it even better than it is today! As a contributor, here are the guidelines we would like you to follow:

- [Contributing to AliceO2 Bookkeeping](#contributing-to-aliceo2-bookkeeping)
  - [Coding conventions](#coding-conventions)
  - [Endpoint conventions](#endpoint-conventions)
    - [Example](#example)
  - [Commit Message Guidelines](#commit-message-guidelines)
    - [Format](#format)
    - [Examples](#examples)
  - [Local Development setup](#local-development-setup)
  - [gRPC](#grpc)
  - [Trunk based development](#trunk-based-development)

## Coding conventions
To ensure consistency throughout the source code, keep these rules in mind as you are working:
- All features or bug fixes must be tested by one or more specs (unit-tests).
- All endpoints must be tested by one or more specs (e2e-tests).
- All code must be formatted. An automated formatter is available (`npm run lint:fix`).

## Endpoint conventions
A **resource can be a singleton or a collection**. For example, "`logs`" is a collection resource and "`log`" is a singleton resource. We can identify "`logs`" collection resource using the URI "`logs`". We can identify a single "`log`" resource using the URI "`/logs/{logId}`".

A **resource may contain sub-collection resources** also. For example, sub-collection resource "`attachments`" of a particular "`log`" can be identified using the URI "`/logs/{logId}/attachments`". Similarly, a singleton resource "`attachment`" inside the sub-collection resource "`logs"` can be identified as follows: "`/logs/{logId}/attachments/{attachmentId}`".

### Example
```
GET   /logs          <---> logs
POST  /logs          <---> logs.push(data)
GET   /logs/1        <---> logs[1]
PUT   /logs/1        <---> logs[1] = data
PATCH /logs/1        <---> logs[1] = { ...logs[1], ...data }
GET   /logs/1/attachments  <---> logs[1].attachments
POST  /logs/1/attachments  <---> logs[1].attachments.push(data)
```

## Commit Message Guidelines
We have very precise rules over how our git commit messages can be formatted. This leads to **more readable messages** that are easy to follow when looking through the **project history**.

### Format
Each commit message consists of a **header** and a **body**. The header has a special format that includes the jira ticket number and a quick description of it
```
[<tiket-number>] <description>

[optional body]
```

### Examples
```
[O2B-111] Update changelog to beta.5
```
```
[O2B-123] Adds new environment details page

```

## Local Development setup
In order to setup Bookkeeping for local development, please follow our guide in which we have step by step instructions: [DEVELOPMENT](/docs/DEVELOPMENT.md)

## [gRPC](/docs/grpc.md)

## Trunk based development

For this project we generally use [trunk based development](https://cloud.google.com/solutions/devops/devops-tech-trunk-based-development).
Before you start coding, make sure you are somewhat familiar with this concept.
You can read more about that [here](https://cloud.google.com/solutions/devops/devops-tech-trunk-based-development) and [here](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow) 
