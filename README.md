# ssh-passthrough

Version 0.0.1 - this should say a lot :) - it is only the first draft of this solution.

## Goals for version 0.1

* possibility of connecting to each container within a docker network (shell mode)
* possibility of executing commands remotely (exec mode)
* ajusting terminal window size "on the fly"

## A few words about...

This application has been inspired by https://github.com/jeroenpeeters/docker-ssh and genarally it has the same goal - to give the oportunity to connect to docker containers via ssh.

The reason why I haven't just forked jeroenpeeters' docker-ssh project is that the "coffee" flavor of javascript doesn't looks very interesting for me - so I decided to rewrite this functionality in "pure" node.js.

For the time being this project has about 5% functionality of the mentioned docker-ssh but it also has one feature that I very miss in the original project - here you don't have to use one container ssh for each container you want to access via ssh - here you can connect with all your containers using one ssh-through container!

The idea is to use the "user" part from ssh login to pass container and user name you want to connect to through ssh-passthrough container:

    $ ssh container/user@ssh-passthrough

Very similar idea has been mentioned in comment: () - but unfortunately there is no more information from the author side since the time of that discussion, so  it is unknown if this functionality is going to be finally included in the docker-ssh or not. 

At first I have just tryied to investigate the problem with using one container to handle all ssh connections, just of curiosity and because I have been looking for  a project to practice programming in node.js. But once this experiment has started to work I decided to publish this work - it is not very functional righ now, but who knows what the future brings :)

## Current status 

Please notice that curently there is no authentication method implemented - ANY! Each connection will be accepted and redirect to requested container - the "/user" part in showed above example has no meaning for the time being, you will be alway connected as a default user configured for a given container (so generally the "root" user). 

Right now I'm focusing on general code architecture for setting up connections with appropriate containers.

## Future plans

The general plan assumes that if the effect will be satisfactory then there is the turn to add authentication and - in futher plans - maybe the use of the external authentication services like LDAP, RDBMS systems, or other.
