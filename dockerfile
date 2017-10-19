FROM node


RUN npm install -g n
RUN n stable
RUN yarn global add npm

ADD front /front
RUN cd /front; npm i
RUN cd /front; npm run build

ADD sails /sails
RUN cd /sails; npm i

WORKDIR /sails

EXPOSE 80
CMD ["npm","run","dist"]
