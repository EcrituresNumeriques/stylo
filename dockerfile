FROM node


RUN npm install -g n
RUN n stable
RUN yarn global add npm

ADD sails /sails
RUN cd /sails; npm i

ADD front /front
RUN cd /front; npm i
RUN cd /front; npm run build

WORKDIR /sails

EXPOSE 80
CMD ["npm","run","dist"]
