# How to install Stylo

Depending on your needs, you may want to install Stylo in different ways :

 - Development (suited for making changes to Stylo rapidly)
 - Production (suited to run securely as an end-user service)


 In any case, you will need on your computer [docker](https://docs.docker.com/install/) and [docker-compose](https://docs.docker.com/compose/install/).
 Development requires node.js and npm installed as well.

## Clone git project

First step is to clone the project, you can use either the HTTPS or SSH version of the repository URL:


    $ git clone git@github.com:EcrituresNumeriques/stylo.git


Stylo uses submodules to pull templates (and those templates are hosted on framagit).
If you have an account with ssh enabled on framagit, you can pull all submodules using the following commands:


    $ git submodule init
    $ git submodule update


# Build on a development machine

Useful to edit the code and see direct changes in local.

**IMPORTANT: NOT SUITED FOR PROLONGED USE BY ACTUAL USERS**

Copy the `docker-compose.yaml` file and configure the environment files:

    $ cp example_docker-compose/docker-compose.yaml docker-compose.yaml
    $ cp example_docker-compose/stylo-*.env .


Then, run the following command:

    $ docker-compose up -d --build

**NOTE:** The first time, this command can take a few dozen minutes depending on your network speed and machine capabilities. Subsequent calls will be faster.

This gives your access to:
- Stylo (frontend): http://localhost:3000
- GraphQL endpoint: http://localhost:3060

## Build for production

Deploying for production is really close, except it tweaks a few things to ensure a smooth run.

We recommend you to host Stylo **behind a reverse proxy**. We provide a working configuration example below for the Nginx server.


### Prepare the server

After _cloning_ the repo, build the service and its dependencies:

    $ cp stylo-example.env stylo.env
    $ docker-compose up -d --build


After the image is built, you should have a Stylo instance running on your server.
Now, we need to expose it to the outside world with a reverse proxy.

### Expose online

Obtain a working sample file with the following command:

    $ wget -O /etc/nginx/sites-available/stylo.conf \
        https://github.com/EcrituresNumeriques/stylo/raw/dev/infrastructure/stylo.huma-num.fr.conf

Replace the service domain name:

    $ sed -i s/stylo.huma-num.fr/STYLO_SUBDOMAIN.MYDOMAIN.TLD/g' /etc/nginx/sites-available/stylo.conf

Alternatively, alter the various ports, and domains on your own.

When you are done, enable the website and reload the configuration:

    $ ln -s /etc/nginx/sites-available/stylo.conf /etc/nginx/sites-enable/stylo.conf
    $ nginx reload
