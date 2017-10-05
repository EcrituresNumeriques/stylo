FROM node

WORKDIR /app
RUN npm install -g pm2 sails
RUN cd /app; npm i

EXPOSE 80
