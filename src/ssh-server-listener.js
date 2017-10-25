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

class SshPassthroughListener {

  constructor(options, passthrough, authMethod, logger) {
    this.options = options
    this.passthrough = passthrough
    this.authMethod = authMethod
    this.logger = logger
  }

  connectionRequest(client) {

    this.logger.debug('Client connected!')

    client.on('authentication', (ctx) => {
      this.authenticationHandler(ctx)
    }).on('ready', () => {
      client.on('session', (accept, reject) => {
        this.sessionHandler(accept, reject)
      })
    }).on('end', () => {
      this.logger.info('Client disconnected')
    });
  }

  authenticationHandler(ctx) {
    this.userStr = ctx.username

    const overrideValues = {}
    if (this.options.combineUsernameSeparator) {
      overrideValues.username = this.extractUsername(ctx.username)
    }

    const result = this.authMethod.auth(ctx, overrideValues)

    if (result === true) {
      ctx.accept()
      this.logger.debug(`client authenticated - user: ${ctx.username}`)
    } else {
      ctx.reject()
      this.logger.error(`client authorisation failed - user: ${ctx.username}`)
    }
  }

  sessionHandler(accept, reject) {
    const session = accept()

    session.on('pty', (accept, reject, info) => {
      accept()
      this.termInfo = info
      this.passthrough.setTermInfo(info)
    });

    session.on('window-change', (accept, reject, info) => {
      this.passthrough.resizeTerm(info)
    });

    session.once('exec', (accept, reject, info) => {
      const channel = accept()
      this.passthrough.setClientChannel(channel, this.userStr)
      this.passthrough.executeCommand(channel, info.command)
      this.execute(channel, this.passthrough)
    });

    session.on('shell', (accept, reject) => {
      const channel = accept()
      this.passthrough.setClientChannel(channel, this.userStr)
      this.passthrough.executeShell(channel)
      this.execute(channel, this.passthrough)
    });

    session.on('signal', (accept, reject, info) => {
      this.logger.debug(`session signal: ${info.name}`)
    })
  }

  execute(channel, passthrough) {
    channel.on('data', (data) => {
      passthrough.passData(data)
    });

    channel.on('error', (e) => {
      this.logger.error(`channel error ${e}`)
    });

    channel.on('end', () => {
      this.logger.debug('channel end...')
    });
  }

  extractUsername(username) {
    let result = ''
    const userData = username.split(this.options.combineUsernameSeparator, 2)
    this.logger.debug(`extract username - additional data: ${userData[0]}, username: ${userData[1]}`)
    if (userData[1] !== undefined) {
      result = userData[1]
    }
    return result
  }
}

module.exports = SshPassthroughListener
