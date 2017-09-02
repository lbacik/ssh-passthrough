FROM node:6-alpine

RUN apk add --no-cache openssh

RUN mkdir /project
COPY . /project
WORKDIR /project

RUN ssh-keygen -f server-key -t rsa -N ''

RUN npm install
CMD ./ssh-passthrough --target=docker --server-prv-key=server-key
