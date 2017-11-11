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

const PassthroughFactory = require('./passthrough/factory')
const AuthMethodFactory = require('./auth/factory')
const fs = require('fs')

class Provider {

  constructor(VERSION, program, logger) {
    this.VERSION = VERSION
    this.program = program
    this.logger = logger
  }

  passthrough() {
    let passthrough
    try {
      passthrough = PassthroughFactory.create(
        this.program.target,
        {
          shell: this.program.shell,
          version: this.VERSION,
          dockerSocket: this.program.dockerSocket,
          dockerSeparator: this.program.combineUsernameSeparator,
        },
        this.logger
      )
    } catch (e) {
      this.logger.error(e.message)
      process.exit(1)
    }
    return passthrough
  }

  authMethod() {
    let authMethod
    try {
      authMethod = AuthMethodFactory.create(
        this.program.auth,
        {
          username: this.program.authPasswordUser,
          password: this.program.authPasswordPass,
          authorizedKeys: this.program.authAuthorizedKeys,
        }
      )
      if (this.program.auth === 'none') {
        this.logger.warn('Currently used AUTH method is NONE!')
      } else {
        this.logger.info(`Currently used AUTH method is ${this.program.auth}.`)
      }
    } catch (e) {
      this.logger.error(e.message)
      process.exit(1)
    }
    return authMethod
  }

  hostPrvKey() {
    let hostPrvKey
    try {
      hostPrvKey = fs.readFileSync(this.program.serverPrvKey)
    } catch (e) {
      this.logger.error(e.message)
      process.exit(1)
    }
    return hostPrvKey
  }
}

module.exports = Provider
