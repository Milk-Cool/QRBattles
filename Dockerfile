FROM node:24

# https://stackoverflow.com/a/35774741
COPY package.json /tmp/package.json
RUN cd /tmp && npm install --verbose
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app

WORKDIR /opt/app
COPY . .

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV
RUN if [ "$NODE_ENV" = "production" ]; then echo HIII; npx vite build; fi

CMD npm start