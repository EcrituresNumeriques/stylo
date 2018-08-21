# How to install Stylo

Depending on your needs, you may want to install stylo in different ways :
 - developpement (suited for changing the code of stylo rapidely)
 - beta (suited for easy installation and few configuration)
 - production (suited for deployement in the long term)

 In any case you will need on your computer docker[https://docs.docker.com/install/] and docker-compose[https://docs.docker.com/compose/install/]
 Developpement require node.js and npm installed as well

# deploy beta

This is the easiest deployement.

You first need to copy the beta docker-compose file to the root folder

`
cp docker-compose/docker-compose.beta.yaml docker-compose.yaml
`

Change all the information you want to change (database path on your machine (default : data/db), port used (default:80))
then run the command

`
docker-compose up -d --build
`

After the image is built, you should have a stylo instance running on http://localhost (or http://localhost:portYouSpecified)

# deploy production

Deploying for production is really close to beta, you just get the ssl working for access to https. For that, you will need a reverse proxy.

We provide example docker-compose yaml file for the Nginx reverse-proxy, but you are free to craft your own depending on your infrastructure.
You first need to copy either just the stylo solution, or the full stylo+reverse proxy solution as your docker-compose.yaml

`
cp docker-compose/docker-compose.prod.yaml docker-compose.yaml
`

OR

`
cp docker-compose/docker-compose.full.yaml docker-compose.yaml
`

Change all the informations you want to change (database path on your machine (default : /home/backup/MongoStylo/db) and the virtual_host+letsencrypt_host that should direct to a domain or subdomain that points to your machine/server via your DNS).

`
vi docker-compose.yaml
`

then run the command

`
docker-compose up -d --build
`

After the image is built, you should have a stylo instance running on your server, provinding access from https at the VIRTUAL_HOST and LETSENCRYPT_HOST specified (they should be the same, and you should direct it from your DNS to your server, idealy prior to running docker-compose up -d --build, this way the SSL certificate gets generated and you don't have to wait for letsEncrypt to purge its DNS cache)

# deploy for testing

Usefull to change the code and see direct changes in local. /!\ NOT SUITED FOR PROLONGATED USE BY ACTUAL USERS /!\

`
cp docker-compose/docker-compose.dev.yaml docker-compose.yaml
`
then run the command

`
docker-compose up -d --build
`

This gives your access to stylo (no-front end) on http://localhost:8080, your mongoDB database on localhost:27017 and your redis instance on localhost:6380 /!\ WITH NO PASSWORD, REMEMBER NOT TO USE FOR ACTUAL USERS /!\

You will need then to build and server the front end via node.js and npm :

`
cd front
npm install
npm run start
`

You will now see the front end on http://localhost:8080

# Add an administrator

The only way to add an administrator (You don't really need one, but to see usage and do basic user operation you will) is to alter the mongodb using the shell.
You can find the name of the mongodb docker instance in your docker-compose.yaml (root of the repo)

`
docker exec -it <NameOfMongoInstance> mongo
`

You will enter the mongo shell, you will need then to type:

`
use sails
db.users.update({email:"<EmailOfTheAccountYouWantAsAdministrator>"},{$set:{admin:true}});
`

the system shoud respond something like, (else, there's something wrong):

`
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
`


the same procedure can be used to remove administrative priviledge with admin:false;
