# Table of Contents

- [Client Application](#client-application)
- [Main Server Model](#main-server-model)
- [Data Pipeline](#data-pipeline)



# Client Application

## Architecture
### In General
Deployed on AWS in a load-balanced AWS Elastic Beanstalk instance.

Images to be used as containers are stored and fetched from the AWS Elastic Container Repository (ECR).

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

#### Content Delivery
The CSS pages are stored in a css directory and are referenced by the HTML as stylesheets.

Javascript plug-ins are delivered through CDN requests in the HTML.

#### Navigating index.js
General function utilities, global variables, and mapping structures are declared first.

Following that, the Javascript for each webpage is divided into 2 sections: Function Definitions and Function Attachments.

The major exception for this is the templates, where function attachments are made within the function definition.

#### Visual Elements with HTML/CSS
The webpages are designed using bootstrapped HTML and modified with custom CSS classes.

By making use of CSS variables, themes and sizing remain consistent throughout the design.

CSS-keyframes are utilized to perform static visual changes as applicable.

#### Controlling Visual Elements with Javascript
The Javascript serves as the main driver for the interface.

It is responsible for performing the majority of dynamic webpage interactions and checks.

Changes to the visual elements are made with Javascript DOM manipulations.

Javascript templates are used to create components that can be added or removed as needed.

#### Getting Data with Javascript
The Fetch API is used as the wrapper for facilitating all HTTP requests.

Cross-origin validation is used to ensure data received from the servers can be represented in the HTML.

#### Storing Data with Javascript
Data received is stored in the local sessionStorage and fetched on an encrypted index.

#### Configuration
Global static variables are configured through a config.js document.

### Support Server
The support server is an Express JS app that receives requests for encryption & decryption and returns the result to the caller.

It uses a routing directory to overlay paths from the exterior ports into the Express instance.

# Main Server Model

## Architecture
### In General
Deployed on AWS.

Images to be used as containers are stored and fetched from the AWS Elastic Container Repository (ECR).

Utilizes the AWS Simple Queue Service (SQS) to facilitate asynchronous execution.

Uses [AWS.dockerrun.json v2](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_docker_v2config.html#create_deploy_docker_v2config_dockerrun) config to orchestrate containers.

### Database
Deployed as a pgSQL server hosted on an AWS EC2 instance.

Administered using SSH protocol.

### Main Server
Deployed as a Python:slim-buster image on a load-balanced Elastic Beanstalk instance.

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

#### Authentication
Authentication is managed through a custom User class.

Information is hashed using Werkzeug security protocols and checked against stored hashes in the database.

Endpoints requiring authentication are guarded with the `@login_required` decorator.

#### Recommendation Model
Streams relevant data from the database using the parameters outlined in the JSON request.

Configures the model weights depending on the user preferences and assigns a random state to ensure varying result states.

Scales relevant dimensions using a Min/Max scaler.

Fits a NN model to the data using a weighted Euclidean distance metric.

Selects the top X homes and returns the data to the caller.

Publishes user search information to the database asynchronously through Celery.

#### Auxiliary Data Functions
Performs back-end support functions like returning user and global data.

To GET a search returns the search parameters.

To PUT a search returns the search results.

Publishes user claps to the database asynchronously through Celery.

#### Celery
Celery is a thread manager for asynchronous execution. Flask has a great initialization pattern built-in.

Calls to `@shared_task` decorated functions push tasks to an AWS SQS queue for later execution.

Worker processes monitor this queue and execute the messages when resources are available.

# Data Pipeline

## Architecture
### In General
Utilizes AWS S3 as the long-term storage location for unstructured data.

Images to be used in task definitions are stored and fetched from the AWS Elastic Container Repository (ECR).

The AWS Elastic Container Service (ECS) is used to define, schedule, and execute tasks.

The AWS Lambda service is used to trigger the Support Pipeline after the Main Pipeline completes.

### Main Pipeline
Deployed as a Python:slim-buster image.

Uses requirements.txt to read dependencies and installs them with pip.

Executes the `data_script.py` script as an entrypoint to allow for command line arguments.

### Support Pipeline
Deployed as a Python:slim-buster image.

Uses requirements.txt to read dependencies and installs them with pip.

Executes the `put_data.py` script as an entrypoint to allow for command line arguments.

## Design
### In General
Data is mined, ingested, and parsed daily using these two pipelines.

Command line arguments allow for ad-hoc modifications to the execution instructions.

### Main Pipeline
Scheduled to run daily as defined by a CRON expression.

Leverages multi-threading practices from the [RedfinScraper](https://github.com/ryansherby/RedfinScraper) library to maximize throughput.

Parses the data in chunks and stores them as parquet files in an AWS S3 bucket.

### Support Pipeline
Scheduled to run upon successful completion of the main pipeline, which is detected using an AWS Lambda expression that monitors an S3 bucket.

Pulls the parquet files from S3 and applies conceptual and logical adjustments to the data.

Establishes a connection to the pgSQL Database and updates the data in the table.


