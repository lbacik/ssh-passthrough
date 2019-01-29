# ssh-passthrough

## A few words about...

This application has been inspired by https://github.com/jeroenpeeters/docker-ssh and genarally it has the same 
goal - to give the oportunity to connect to docker's containers via ssh.

The reason why I just haven't forked from jeroenpeeters' docker-ssh project is that he had used "coffee", 
and I prefer rather "pure" javascript.

The main differnce between the original project and this one is that here you don't have to use "ssh container" 
for each container you want to access via ssh - here you can connect with all your containers through one 
ssh-passthrough container!

The idea is to use the "user" part from ssh login to pass container and user name you want to connect to through 
ssh-passthrough container:

    $ ssh container/user@ssh-passthrough
    
Two things to notice here: (1) the "user" part in above example is going to be validate on ssh-passhtrough node, 
not on the  target container, and (2) it (the "user" part) can be ommited when the ssh keys authentication is used 
(once again - such authentication is of course handled be ssh-passthrough container - see options below). 

Very similar idea has been mentioned in https://github.com/jeroenpeeters/docker-ssh/issues/4 - but unfortunately 
there is no more information from the author since the time of that discussion, so it is unknown whether this 
functionality is going to be finally included in the docker-ssh or not. 

At first I have just tried to investigate the problem with using one container to handle all ssh connections - just 
of curiosity and because I had been looking for a project to practice programming in node.js. 
But once this experiment has started to work I decided to publish it.

## How to use it

Example of creating the container (using 'password' (default) type of authentication):

     $ docker run --rm -d \
        -p IP_ADDRESS:2222:22/tcp \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -e AUTH_USER=user \
        -e AUTH_PASS=secret \
        lbacik/ssh-passthrough

Example of connecting to the particular "container" (where "container" is a container name):

    $ ssh -p 2222 container/user@IP_ADDRESS

*Important!* The form "container/user" makes sense only for "password" authentication method, for other methods 
(none and publickey) the "user part" of the ssh command should look as follows:

    $ ssh -p 2222 container@IP_ADDRESS

## Starting server from command line

When you want to start the server from the command line (without using the prepared docker container) then you 
must manually created server-key, please in this case run in ssh-passthrough main directory:

    $ ssh-keygen -f server-key -t rsa -N ''
    
On MacOS you should add one additional parameter:

    $ ssh-keygen -f server-key -t rsa -N '' -m PEM  

## Authentication methods

Method can be chosen by AUTH_METHOD environment variable or "--auth" command line option.

* none - NO AUTHENTICATION! You can ommit the "user" part in connection string.
* password (default) - require to be specified "user" and "password" (as an env variable or through the command 
line option). Please notice that this user and pass will allow to connect to ALL of yours containers (there is no 
"per container" configuration available yet)!
* publickey - is required the "--auth-authorized-keys" command line option or "AUTHORIZED_KEYS" env variable to be set,
access will be granted to all users whose public keys have been added to the indicated file.

## Parameters

### Command line options

    ./ssh-passthrough --help
    
    Usage: ssh-passthrough [options]
    
      ssh "passthrough" server for containers environments, version: 0.2.5
    
    Options:
    
        -V, --version                             output the version number
        --server-prv-key [path]                   ssh private key used by ssh-passthrough server (default: server-key)
        -a, --address [ip]                        ip address the server should use (default: 127.0.0.1)
        -p, --port [port]                         port the server should listening on (default: 22)
        --target [target]                         (1) "shell" (not very useful, only for tests right now), (2) "docker" (default: shell)
        -s, --shell [shell]                       shell/process that should be started on "target" to handle the connection (default: /bin/zsh)
        --docker-socket [socket]                  docker api endpoint (default: /var/run/docker.sock)
        --combine-username                        whether the user part of ssh connection string contains the container name or not (makes sense when auth=password)
        --combine-username-separator [separator]  separator used to separate the extra data (container name) and username in ssh login string (default: /)
        --auth [method]                           authentication method used by server: (1) "none", (2) "password" or (3) "publickey" (default: password)
        --auth-password-user [user]               username used when password authentication method has been chosen
        --auth-password-pass [password]           password used when password authentication method has been chosen
        --auth-authorized-keys [file]             file contains allowed users ssh public keys used when pubilckey authentication method has been chosen
        -h, --help                                output usage information
    
    for more information please visit: https://github.com/lbacik/ssh-passthrough
    
### Possible ENV options

|Environment Variable|Command line equivalent|
|--------------------|-----------------------|
|SHELL|--shell [shell]|
|AUTH_METHOD|--auth [method]|
|AUTH_USER|--auth-password-user [user]|
|AUTH_PASS|--auth-password-pass [password]|
|AUTHORIZED_KEYS|--auth-authorized-keys [file]|

## Future plans

Maybe the use of the external authentication services like LDAP, RDBMS systems, or other.

## Examples

#### local test

To start server locally, on localhost:2222, without authentication:

    $ ./ssh-passthrough -p 2222 --target=docker --auth=none --shell=/bin/bash
    
Then you can access you docker containers with:

    $ ssh coantainerName@localhost -p 2222  
    
Please notice the "--shell" option, without it ssh-passthrough will attempt to start in target container your 
locally used shell (and in case of zsh or fish it will generally cause problems).


#### public key authentication

The example of authentication with ssh keys, using docker image:

     $ docker run --rm -d \
        -p LOCALADDRESS:2222:22/tcp \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -v /PATH_TO_FILE_WITH_SSH_PUB_KEYS:/root/ssh-passthrough-authorised-keys
        -e AUTH_METHOD=publickey \
        -e AUTH_AUTHORIZED_KEYS=/root/ssh-passthrough-authorised-keys \
        -e SHELL=/bin/bash \
        lbacik/ssh-passthrough

