FROM node:11

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY app.js app.js
COPY data/defaultsData.js data/defaultsData.js
COPY models models
COPY data/users data/users.json
COPY data/articles data/articles.json
COPY data/Versions data/versions.json
COPY data/user_credentials data/user_credentials.json

COPY migrate.js migrate.js

EXPOSE 80
CMD ["npm", "run", "start"]

