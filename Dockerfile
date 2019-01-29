FROM node:11-alpine

RUN apk add --no-cache openssh

RUN mkdir /project
COPY . /project
WORKDIR /project

RUN ssh-keygen -f server-key -t rsa -N ''

RUN npm install

CMD ./ssh-passthrough --target=docker --server-prv-key=server-key --address=0.0.0.0 --combine-username
