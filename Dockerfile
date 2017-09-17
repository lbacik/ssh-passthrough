FROM hypriot/rpi-node:6-slim

RUN apt-get -y update \
	&& apt-get -y install openssh-client

RUN mkdir /project
COPY . /project
WORKDIR /project

RUN ssh-keygen -f server-key -t rsa -N ''

RUN npm install

CMD ./ssh-passthrough --target=docker --server-prv-key=server-key --address=0.0.0.0
