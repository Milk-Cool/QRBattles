FROM node:24

COPY . .

RUN npm i --verbose
CMD npm start