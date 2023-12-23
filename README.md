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

Deploys a build of HTML, Javascript, and CSS.

### Support Server
Deployed as a Node:alpine image.

Uses package.json to identify dependencies and installs them with npm.

Executes npm startup command.

Deploys a Javascript Express server instance.

## Design
### In General
The client application is comprised of the front-end Javascript, HTML/CSS webpages, and a small support server for encryption.

Communication with the support server and main server is facilitated through validated HTTP requests.

### Main Interface

#### Structure
The HTML is stored in the parent directory. The CSS pages are stored in a css directory and are referenced by the HTML. Javascript plug-ins are delivered through CDN requests in the HTML.

The native Javascript is separated into conceptual pieces within the index.js file. General function utilities, global variables, and mapping structures are declared first. Following that, the Javascript for each webpage is divided into 2 sections: Function Definitions and Function Attachments. The major exception for this is the templates, where function attachments are made within the function definition.

#### Visual Elements with HTML/CSS
The webpages are designed using bootstrapped HTML and modified with custom CSS classes. By making use of CSS variables, themes and sizing remain consistent throughout the design. CSS-keyframes are utilized to perform static visual changes as applicable.

#### Controlling Visual Elements with Javascript
The Javascript serves as the main driver for the interface. It is responsible for performing the majority of dynamic webpage interactions and checks. Changes to the visual elements are made with Javascript DOM manipulations, and Javascript templates are used to create components that can be added or removed as needed.

#### Getting Data with Javascript
The Fetch API is used as the wrapper for facilitating all HTTP requests. Cross-origin validation is used to ensure data received from the servers can be represented in the HTML.

#### Storing Data with Javascript
Data received is stored in the local sessionStorage and fetched on an encrypted index.

#### Configuration
Global static variables are configured through a config.js document.

### Support Server
The support server is an Express JS app that receives requests for encryption & decryption and returns the result to the caller.

It uses a routing directory to overlay paths from the exterior ports into the Express instance.

# Main Server Model

## Architecture

### Database
Deployed as a pgSQL server hosted on an AWS EC2 instance.

Administered using SSH protocol.

### Main Server
Deployed as a Python:slim-buster image.

Uses requirements.txt to read dependencies and installs them with pip.

Uses supervisord.conf to configure execution of the Flask and Celery programs.

Installs 3 required libraries not pre-installed on the image using apt-get.

Executes supervisord by calling the location of the executable.

Deploys a Flask application supported by a fleet of Celery workers managed by supervisord.

## Design

### In General
Communication with the server is facilitated through HTTP requests.

Wrapper libraries are used to manage the connection with the database.

### Database

#### Role Management
Roles are granted the minimum privileges necessary to execute their function.

Connection to the database is authenticated using user information.

#### Schema
Each record is dependent on a single primary key.

1-to-1 relationships are defined using a single table.

1-to-many relationships are defined by linking a foreign key to the primary table.

Many-to-many relationships are defined using a common join table.

### Main Server

#### Flask Application Factory
The Flask Application factory pattern is used to ingest the config, register blueprints, and host the application.

The config is the primary source for all global static variables.

Blueprints are registered with a routing prefix to facilitate overlaying paths from the exterior ports into the container.

#### Authorization
Allows all pre-flight requests to facilitate custom header requests.

Denies non-pre-flight requests provided they do not originate from the specified URLs.

Cross-origin access is granted provided the request matches the host URL.

### Authentication
Authentication is managed through a custom User class.

Information is hashed using Werkzeug security protocols and checked against stored hashes in the database.

#### Recommendation Model
Streams relevant data from the database using the parameters outlined in the JSON request.

Configures the model weights depending on the user preferences and assigns a random state to ensure varying result states.

#### Auxiliary Data Functions

#### Celery





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

