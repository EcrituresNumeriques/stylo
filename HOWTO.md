# How to install Stylo

Depending on your needs, you may want to install Stylo in different ways :

 - Development (suited for making changes to Stylo rapidly)
 - beta (suited for easy installation and few configuration)
 - production (suited for deployment in the long term)


 In any case, you will need on your computer [docker](https://docs.docker.com/install/) and [docker-compose](https://docs.docker.com/compose/install/).
 Development requires node.js and npm installed as well.

## Clone git project

First step is to clone the project, you can use either the HTTPS or SSH version of the repository URL:


    $ git clone git@github.com:EcrituresNumeriques/stylo.git


Stylo uses submodules to pull templates (and those templates are hosted on framagit).
If you have an account with ssh enabled on framagit, you can pull all submodules using the following commands:


    $ git submodule init
    $ git submodule update


## deploy beta

This is the easiest deployment.

You first need to copy the beta docker-compose file to the root folder:


    $ cp example_docker-compose/docker-compose.beta.yaml docker-compose.yaml


Change all the information you want to change:

- database path on your machine (default: `data/db`),
- port used (default: `80`),
- ...

Then run the following command:


    $ docker-compose up -d --build


After the image is built, you should have a Stylo instance running on http://localhost.

**NOTE:** If you've specified a custom port, you will need to add it to the URL. For instance, if you are using port `1234`, the URL will be http://localhost:1234.

## deploy production

Deploying for production is really close to beta but, in addition, we need to configure an SSL endpoint to access Stylo over HTTPS. For that, we need to setup a reverse proxy.

We provide an sample docker-compose.yaml file that includes a NGINX reverse proxy, but you are free to use your own reverse proxy depending on your infrastructure.

If you want to deploy Stylo without a reverse proxy, then you should use the file `docker-compose.prod.yaml`:


    $ cp example_docker-compose/docker-compose.prod.yaml docker-compose.yaml


Alternatively, you can use the file `docker-compose.full.yaml` to deploy Stylo and a pre-configured NGINX reverse proxy:


    $ cp example_docker-compose/docker-compose.full.yaml docker-compose.yaml


Change all the informations you want to change:
- database path on your machine (default: `/home/backup/MongoStylo/db`),
- and the `virtual_host` + `letsencrypt_host` that should use your domain or subdomain (that points to your machine/server via your DNS).

Then, run the following command:


    $ docker-compose up -d --build


After the image is built, you should have a Stylo instance running on your server, provinding access over HTTPS at the `VIRTUAL_HOST` and `LETSENCRYPT_HOST` specified (they should be the same, and you should direct it from your DNS to your server, ideally prior to running `docker-compose up -d --build`, this way the SSL certificate gets generated and you don't have to wait for letsEncrypt to purge its DNS cache).

# Deploy for testing

Useful to edit the code and see direct changes in local.

**IMPORTANT: NOT SUITED FOR PROLONGED USE BY ACTUAL USERS**

First, checkout the `dev` branch:

    $ git checkout dev

Then, copy the `docker-compose.dev.yaml` file:

    $ cp example_docker-compose/docker-compose.dev.yaml docker-compose.yaml

Since this docker-compose file is using a default external network called `root_default`, you will need to create it (if it does not already exists on your machine):


    $ docker network create root_default


Then, run the following command:

    $ docker-compose up -d --build

**NOTE:** The first time, this command can take a few dozen minutes depending on your network speed and machine capabilities. Subsequent calls will be faster.

This gives your access to Stylo (no frontend) on http://localhost:8080, your MongoDB database on localhost:27017 and your Redis instance on localhost:6380

**IMPORTANT: DATABASES ARE UNSECURED USING NO PASSWORD, REMEMBER NOT TO USE FOR ACTUAL USERS**

Then, you will need to build and serve the frontend via Node.js and npm :

```
cd front/gatsby
npm install
npm run start
```

You will now see the frontend on http://localhost:8080

## Add an administrator

The only way to add an administrator (you don't really need one, but to see usage and do basic user operations you will) is to alter the mongodb using the shell.
You can find the name of the mongodb docker instance in your `docker-compose.yaml` (at the root of your repository).


    $ docker exec -it <NameOfMongoInstance> mongo


You will enter the mongo shell, then type the following command to alter an existing account as an administrator:

```
use sails
db.users.update({email:"<EmailOfTheAccountYouWantAsAdministrator>"},{$set:{admin:true}});
```

The system shoud respond:

```
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
```

Otherwise there's something wrong!

The same procedure can be used to remove administrative priviledge with `admin:false`.
