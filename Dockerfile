FROM node:16

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

ENV SERVER_PORT = 8080

RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "run", "start"]