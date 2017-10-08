FROM node

ADD sails /sails
ADD front /front

RUN cd /front; npm i
RUN cd /sails; npm i

WORKDIR /sails

EXPOSE 80
CMD ["npm","run","dist"]
