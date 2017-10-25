# ssh-passthrough

**Version 0.2**

## A few words about...

This application has been inspired by https://github.com/jeroenpeeters/docker-ssh and genarally it has the same goal - to give the oportunity to connect to docker containers via ssh.

The reason why I haven't just done fork from jeroenpeeters' docker-ssh project is that he used the "coffee". I decided to rewrite this functionality in "pure" javascript.

The main differnce between the original project and this one is that here you don't have to use "ssh container" for each container you want to access via ssh - here you can connect with all your containers using one ssh-through container!

The idea is to use the "user" part from ssh login to pass container and user name you want to connect to through ssh-passthrough container:

    $ ssh container/user@ssh-passthrough

Very similar idea has been mentioned in https://github.com/jeroenpeeters/docker-ssh/issues/4 - but unfortunately there is no more information from the author since the time of that discussion, so  it is unknown if this functionality is going to be finally included in the docker-ssh or not. 

At first I have just tryied to investigate the problem with using one container to handle all ssh connections, just of curiosity and because I have been looking for  a project to practice programming in node.js. But once this experiment has started to work I decided to publish it.

## How to use it

Example of creating the container (using 'password' (default) type of authentication):

     $ docker run --rm -d \
        -p LOCALADDRESS:2222:22/tcp \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -e AUTH_USER=user \
        -e AUTH_PASS=secret \
        lbacik/ssh-passthrough

Example of connecting to the particular "container" (where "container" is a container name):

    $ ssh -p 2222 container/user@LOCALADDRESS

## Authentication mathods

Method can be chosen by AUTH_METHOD environment variable or "--auth" command line option.

* none - NO AUTHENTICATION! You can ommit the "user" part in connection string.
* password (default) - require to be specified "user" and "password" (as an env variable or through the command line option). Please notice that this user and pass will allow to connect to ALL of yours containers (there is no "per container" configuration available yet)!

## Future plans

Maybe the use of the external authentication services like LDAP, RDBMS systems, or other.
