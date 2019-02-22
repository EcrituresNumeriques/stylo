FROM node:11

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY gatsby/package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production



EXPOSE 80 
CMD [ "npm", "run", "develop" ]