FROM node:16
WORKDIR /usr/src/coordgen
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 2000
CMD [ "node", "./bin/www" ]