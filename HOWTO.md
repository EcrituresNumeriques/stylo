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

First, checkout the `dev` branch:

    $ git checkout dev

Then, copy the `docker-compose.dev.yaml` file:

    $ cp example_docker-compose/docker-compose.dev.yaml docker-compose.yaml


Then, run the following command:

    $ docker-compose up -d --build

**NOTE:** The first time, this command can take a few dozen minutes depending on your network speed and machine capabilities. Subsequent calls will be faster.

This gives your access to:
- Stylo (frontend): http://localhost:3000
- GraphQL endpoint: http://localhost:3060
- MongoDB administration tool: http://localhost:3031


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
