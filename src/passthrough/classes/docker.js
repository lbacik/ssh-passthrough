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

const Passthrough = require('../passthrough')

class SSHDocker extends Passthrough {

  constructor(docker, options, logger) {
    super(logger)
    this.docker = docker
    this.options = options
  }

  passData(data) {
    this.containerStream.write(data)
  }

  setClientChannel(clientChannel, data) {
    this.setUserAndContainerName(data)
    this.container = this.docker.getContainer(this.containerName)
  }

  executeCommand(clientStream, command) {
    const cmd = [this.options.shell, '-c', command]
    this.execute(clientStream, cmd)
  }

  executeShell(clientStream) {
    const cmd = [this.options.shell]
    this.execute(clientStream, cmd)
  }

  execute(clientStream, cmd) {
    this.container.exec({
      Cmd: cmd,
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
    },
    (err, exec) => {
      if (err) {
        this.logger.error(`container exec error! ${err}`)
        clientStream.write(`Cannot conect to container ${this.containerName} `);
        this.closeStream(clientStream)
      } else {
        this.exec = exec
        exec.start({ stdin: true, Tty: true }, (execErr, containerStream) => {
          if (execErr) {
            this.logger.error(`exec start error! ${execErr}`)
          }
          this.comunicationHandler(containerStream, clientStream)
        })
      }
    })
  }

  comunicationHandler(containerStream, clientStream) {
    this.containerStream = containerStream

    containerStream.on('data', (data) => {
      clientStream.write(data.toString())
    });

    containerStream.on('error', (streamErr) => {
      this.logger.error(`container exec stream error ${streamErr}`)
      this.closeStream(clientStream)
    })

    containerStream.on('end', () => {
      this.logger.info('container exec end')
      this.closeStream(clientStream)
    })

    containerStream.write(`# SSH-PASSTHROUGH v${this.options.version}\r\n`)
    containerStream.write('export TERM=linux;\r\n')

    if (this.options.termInfo) {
      this.resizeTerm(this.options.termInfo)
    }
  }

  setUserAndContainerName(str) {
    const userData = str.split(this.options.dockerSeparator, 2)
    this.logger.debug(`container: ${userData[0]}, user: ${userData[1]}`)
    this.containerName = userData[0]
  }

  resizeTerm(termInfo) {
    if (termInfo) {
      this.exec.resize({ h: termInfo.rows, w: termInfo.cols })
    }
  }

  closeStream(stream) {
    stream.exit(0)
    stream.end()
  }
}

module.exports = SSHDocker
