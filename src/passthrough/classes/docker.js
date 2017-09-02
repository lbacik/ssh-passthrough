//
// Copyright (C) 2015 Lukasz Bacik <mail@luka.sh>
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.

const Passthrough = require('../passthrough');
const Docker = require('dockerode');

class SSHDocker extends Passthrough {
  options(data) {
    this.socketPath = data.dockerSocket;
    this.shellName = data.shell;
    this.separator = data.separator;
  }

  init() {
    this.docker = new Docker({ socketPath: this.socketPath });
  }

  passData(data) {
    this.containerStream.write(data);
  }

  setClientChannel(clientChannel, data) {
    this.setUserAndContainerName(data);
    this.container = this.docker.getContainer(this.containerName);
    this.shellExecute(clientChannel);
  }

  shellExecute(clientStream) {
    this.container.exec({
      Cmd: [this.shellName],
      AttachStdin: true,
      AttachStdout: true,
      Tty: true,
    },
    (err, exec) => {
      if (err) {
        console.log(`container exec error! ${err}`);
      }

      exec.start({ stdin: true, Tty: true }, (execErr, stream) => {
        if (err) {
          console.log(`exec start error! ${execErr}`);
        }

        this.containerStream = stream;

        stream.on('data', (data) => {
          clientStream.write(data.toString());
        });

        stream.on('error', (streamErr) => {
          console.log(`container exec stream error ${streamErr}`);
          this.closeStream(clientStream);
        });

        stream.on('end', () => {
          console.log('container exec end');
          this.closeStream(clientStream);
        });
      });
    });
  }

  setUserAndContainerName(str) {
    const userData = str.split('/', 2);

    console.log(`container: ${userData[0]}`);
    console.log(`user: ${userData[1]}`);

    this.containerName = userData[0];
  }

  closeStream(stream) {
    stream.exit(0);
    stream.end();
  }
}

module.exports = SSHDocker;
