# Contributing to AliceO2 Bookkeeping
We would love for you to contribute to *AliceO2 Bookkeeping* and help make it even better than it is today! As a contributor, here are the guidelines we would like you to follow:
- [Coding conventions](#coding-conventions)
- [Endpoint conventions](#endpoint-conventions)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Trunk based development guidelines](#trunk-based-development)

## Coding conventions
To ensure consistency throughout the source code, keep these rules in mind as you are working:
- All features or bug fixes must be tested by one or more specs (unit-tests).
- All endpoints must be tested by one or more specs (e2e-tests).
- All code must be formatted. An automated formatter is available (`npm run lint:fix`).

## Endpoint conventions
A **resource can be a singleton or a collection**. For example, "`customers`" is a collection resource and "`customer`" is a singleton resource (in a banking domain). We can identify "`customers`" collection resource using the URI "`customers`". We can identify a single "`customer`" resource using the URI "`/customers/{customerId}`".

A **resource may contain sub-collection resources** also. For example, sub-collection resource "`accounts`" of a particular "`customer`" can be identified using the URI "`/customers/{customerId}/accounts`" (in a banking domain). Similarly, a singleton resource "`account`" inside the sub-collection resource "`accounts"` can be identified as follows: "`/customers/{customerId}/accounts/{accountId}`".

### Example
```
GET   /orders          <---> orders
POST  /orders          <---> orders.push(data)
GET   /orders/1        <---> orders[1]
PUT   /orders/1        <---> orders[1] = data
PATCH /orders/1        <---> orders[1] = { ...orders[1], ...data }
GET   /orders/1/lines  <---> orders[1].lines
POST  /orders/1/lines  <---> orders[1].lines.push(data)
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
docs(changelog): update changelog to beta.5
```
```
fix(release): need to depend on latest rxjs and zone.js

The version in our package.json gets copied to the one we publish, and users need the latest of these.
```

## Trunk based development

For this project we generally use [trunk based development](https://cloud.google.com/solutions/devops/devops-tech-trunk-based-development).
Before you start coding, make sure you are somewhat familiar with this concept.
You can read more about that [here](https://cloud.google.com/solutions/devops/devops-tech-trunk-based-development) and [here](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow) 
