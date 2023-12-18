# Table of Contents

- [Client Application](#client-application)
- [Main Server Model](#main-server-model)
- [Data Pipeline](#data-pipeline)



# Client Application

## Architecture
### In General
Deployed in a load-balanced AWS Elastic Beanstalk instance.

Uses [AWS.dockerrun.json v2](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_docker_v2config.html#create_deploy_docker_v2config_dockerrun) config to orchestrate containers.

### Main Interface
Deployed as a Nginx image.

Uses nginx.conf to expose the same port as the container.

Executes nginx startup command running in the foreground (no daemon).

### Support Server
Deployed as a Node:alpine image.

Uses package.json to identify dependencies and installs them with npm.

Executes npm startup command.

## Design
### In General
The front-end application is responsible for hosting all client-side javascript

### Main Interface

### Support Server



# Main Server Model

## Architecture
### Main Server
Test

## Design
### Main Server
test




# Data Pipeline

## Architecture
### Main Pipeline
Test

### Support Pipeline
test

## Design
### Main Pipeline
test

### Support Pipeline
test

